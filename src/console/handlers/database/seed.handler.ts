import {
    databasePath,
    DbCliOptions,
    dbConfig,
    dbNames,
    DbOptionsType,
    getCurrentDb,
    makeConnect,
    matchGlobs,
    panic,
    requireDefault,
    requirePaths,
    runSeeder,
    SeedArguments,
    SeederConstructor,
    setCurrentDb,
} from '@/core';
import chalk from 'chalk';
import ora from 'ora';

async function seederRunner(
    spinner: ora.Ora,
    args: SeedArguments,
    isSubHandler: boolean,
    connectionName: string,
) {
    let options: DbCliOptions;
    try {
        // 获取连接的CLI配置
        options = dbConfig(connectionName, DbOptionsType.CLI) as DbCliOptions;
        spinner.succeed(`Connection Option for ${connectionName} loaded`);
    } catch (error) {
        panic(
            spinner,
            `Could not load config of connection which named ${connectionName}!`,
            error,
        );
    }

    // 根据此连接的'factories'配置require所有的factory文件
    spinner.start('Including Factories');
    const factoryFiles = matchGlobs(
        options!.factories || [databasePath('factories/**/*.factory{.js,.ts}')],
        {},
        true,
    );

    try {
        requirePaths(factoryFiles);
        spinner.succeed('Factories are included');
    } catch (error) {
        panic(spinner, 'Could not include factories!', error);
    }

    // 根据此连接的'seeds'配置加载所有的seeder文件并遍历过滤
    // 如果命令行指定class选项则只获取指定seeder,没有则使用默认的DatabaseSeeder类
    spinner.start('Including Seeders');
    const seedFiles = matchGlobs(
        options!.seeds || [databasePath('seeder/**/*.seed{.js,.ts}')],
        {},
        true,
    );
    let seeders: SeederConstructor[] = [];
    let currentSeeder: SeederConstructor | undefined;
    try {
        seeders = seedFiles.map((seedFile) =>
            requireDefault<SeederConstructor>(seedFile),
        );
        currentSeeder = seeders.find((item) =>
            args.class === undefined
                ? item.name === 'DatabaseSeeder'
                : item.name === args.class,
        );
        if (!currentSeeder) {
            panic(
                spinner,
                `seeder class which namaed ${args.class} or DatabaseSeeder not exists`,
                new Error('seeder not found'),
            );
        }
        spinner.succeed('Seeders are included');
    } catch (error) {
        panic(spinner, 'Could not include seeders!', error);
    }
    // 根据connection选项获取typeorm的数据库连接对象并设置其为当前连接
    // 没有指定connection则使用默认连接
    if (!isSubHandler) {
        spinner.start('Connecting to the database');
        try {
            setCurrentDb({ name: connectionName });
            const connection = await makeConnect(connectionName);
            setCurrentDb({ connection });
            spinner.succeed('Database connected');
        } catch (error) {
            panic(spinner, 'Database connection failed!.', error);
        }
    }

    // 运行seeder
    spinner.start(`Executing ${currentSeeder!.name} Seeder`);
    try {
        await runSeeder(
            currentSeeder!,
            seeders.filter((item) => item.name !== 'DatabaseSeeder'),
            args,
            spinner,
        );
        spinner.succeed(`Seeder ${currentSeeder!.name} executed`);
    } catch (error) {
        panic(spinner, `Could not run the seed ${currentSeeder!.name}!`, error);
    }
}

export const SeedHandler = async (
    args: SeedArguments,
    isSubHandler = false,
) => {
    // tslint:disable-next-line
    const { log } = console;
    if (isSubHandler) {
        const spinner = ora('Start run seeder').start();
        await seederRunner(spinner, args, isSubHandler, getCurrentDb('name'));
    } else {
        const spinner = ora('Loading database config').start();
        let connectionNames: string[] = [];
        try {
            // 获取所有连接配置名
            connectionNames = args.connection ? [args.connection] : dbNames();
            spinner.succeed('Loading config succeed');
        } catch (error) {
            panic(spinner, 'Load database config failed.', error);
        }

        // 遍历连接并运行seed
        for (const name of connectionNames) {
            await seederRunner(spinner, args, isSubHandler, name);
        }
        await getCurrentDb('connection').close();
    }
    log('👍 ', chalk.greenBright.underline(`Finished Seeding`));
    process.exit(0);
};
