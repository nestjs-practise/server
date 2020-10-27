import {
    ConfigRegister,
    databasePath,
    DbConfig,
    env,
    rootPath,
    srcPath,
} from '@/core';

export const database: ConfigRegister<DbConfig> = () => ({
    default: env('DATABASE_NAME', 'mysql'),
    enabled: ['mysql2'],
    connections: [
        {
            name: 'sqlite',
            type: 'sqlite',
            database: rootPath(env('DATABASE_PATH', 'database.sqlite')),
        },
        {
            name: 'mysql',
            type: 'mysql',
            host: env('DATABASE_HOST', '127.0.0.1'),
            port: env('DATABASE_PORT', (v) => Number(v), 3306),
            username: env('DATABASE_USERNAME', 'root'),
            password: env('DATABASE_PASSWORD', '123456'),
            database: env('DATABASE_NAME', 'cms'),
        },
        {
            name: 'mysql2',
            type: 'mysql',
            host: env('DATABASE_HOST', '127.0.0.1'),
            port: env('DATABASE_PORT', (v) => Number(v), 3306),
            username: env('DATABASE_USERNAME', 'root'),
            password: env('DATABASE_PASSWORD', '123456'),
            database: env('DATABASE_NAME', 'gkr'),
        },
    ],
    common: {
        dropSchema: false,
        synchronize: false,
        logging: ['error'],
        entities: [srcPath('modules/**/entities/**/*.entity{.ts,.js}', false)],
        subscribers: [
            srcPath('modules/**/subscribers/**/*.subscriber{.ts,.js}', false),
        ],
        migrations: [databasePath('migration/**/*{.ts,.js}', false)],
        seeds: [databasePath('seeder/**/*.seed{.js,.ts}', false)],
        factories: [databasePath('factories/**/*.factory{.js,.ts}', false)],
        cli: {
            entitiesDir: srcPath('entities', false),
            migrationsDir: databasePath('migration', false),
            subscribersDir: srcPath('subscribers', false),
        },
    },
});
