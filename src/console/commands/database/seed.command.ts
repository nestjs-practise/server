import { SeedArguments } from '@/core';
import * as yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['seed', 's'];
export const describe = 'Runs the databased seeds';
export const builder = {
    connection: {
        type: 'string',
        alias: 'c',
        describe: 'Connection name of typeorm to connect database.',
    },
    seeder: {
        type: 'string',
        alias: 's',
        describe: 'Specific seed class to run.',
    },
};

export const handler = async (args: SeedArguments & yargs.Arguments) =>
    await database.SeedHandler(args);
