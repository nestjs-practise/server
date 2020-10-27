import yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['migration:run', 'mr'];
export const describe = 'Runs all pending migrations.';
export const builder = {
    connection: {
        type: 'string',
        alias: 'c',
        describe: 'Connection name of typeorm to connect database.',
    },
    transaction: {
        type: 'string',
        alias: 't',
        describe:
            ' Indicates if transaction should be used or not formigration revert. Enabled by default.',
        default: 'default',
    },
    config: {
        type: 'string',
        alias: 'f',
        describe: 'Name of the file with connection configuration.',
    },
};

export const handler = async (args: any & yargs.Arguments) =>
    await database.MigrationRunHandler(args);
