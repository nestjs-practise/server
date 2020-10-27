import {
    DbRefreshArguments,
    defaultDbName,
    getCurrentDb,
    makeCurrentDb,
    panic,
} from '@/core';
import chalk from 'chalk';
import ora from 'ora';
import { SeedHandler } from './seed.handler';

export const ResetHandler = async (args: DbRefreshArguments) => {
    const { log } = console;
    const spinner = ora('Start connect to database').start();
    const cname = args.connection ?? defaultDbName();
    await makeCurrentDb(cname, spinner);
    const connection = getCurrentDb('connection');
    try {
        spinner.start('Start sync entity to database');
        await connection.dropDatabase();
        await connection.synchronize();
        spinner.succeed('Database connected');
    } catch (error) {
        panic(spinner, 'Database sync failed', error);
    }
    if (args.seed) {
        await SeedHandler({ forceInit: true }, true);
    }
    await connection.close();
    log('👍 ', chalk.greenBright.underline('Finished reset database'));
    process.exit(0);
};
