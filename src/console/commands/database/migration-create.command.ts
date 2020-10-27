import yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['migration:create', 'mc'];
export const describe = 'Creates a new migration file';
export const builder = {
    connection: {
        type: 'string',
        alias: 'c',
        describe: 'Connection name of typeorm to connect database.',
    },
    name: {
        type: 'string',
        alias: 'n',
        describe: 'Name of the migration class.',
        demandOption: true,
    },
    dir: {
        type: 'string',
        alias: 'd',
        describe: 'Directory where migration should be created.',
    },
    config: {
        type: 'string',
        alias: 'f',
        describe: 'Name of the file with connection configuration.',
    },
};

export const handler = async (args: any & yargs.Arguments) =>
    await database.MigrationCreateHandler(args);
