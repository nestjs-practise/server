import yargs from 'yargs';

export const command = 'db <command>';
export const describe = 'Database commands';
export const builder = (cli: yargs.Argv) =>
    cli.commandDir('database', {
        extensions: ['js', 'ts'],
    });
export const handler = async (args: any & yargs.Arguments) => () => {};
