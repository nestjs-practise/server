import { DbRefreshArguments } from '@/core';
import * as yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['reset', 'r'];
export const describe = 'Delete all tables and run migrate';
export const builder = {
    connection: {
        type: 'string',
        alias: 'c',
        describe: 'Connection name of typeorm to connect database.',
    },
    seed: {
        type: 'boolean',
        alias: 's',
        describe: 'Run seed for database.',
    },
};

export const handler = async (args: DbRefreshArguments & yargs.Arguments) =>
    await database.ResetHandler(args);
