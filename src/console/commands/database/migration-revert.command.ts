import yargs from 'yargs';
import { database } from '../../handlers';

export const command = ['migration:resvert', 'mv'];
export const describe = 'Reverts last executed migration';
export const builder = {
    connection: {
        type: 'string',
        alias: 'c',
        describe: 'Name of the connection on which run a query.',
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
    await database.MigrationRevertHandler(args);
