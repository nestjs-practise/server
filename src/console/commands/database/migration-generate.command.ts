import yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['migration:generate', 'mg'];
export const describe =
    'Generates a new migration file with sql needs to be executed to update schema.';
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
    pretty: {
        type: 'boolean',
        alias: 'p',
        describe: 'Name of the migration class.',
        default: false,
    },
};

export const handler = async (args: any & yargs.Arguments) =>
    await database.MigrationGenerateHandler(args);
