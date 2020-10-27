import { exec, getCurrentDb } from '@/core';
import { getTypeorm } from './typeorm';

export const MigrationCreateHandler = async (args: any) => {
    const typeCommand = await getTypeorm(args);
    let command = `${typeCommand} migration:create -n ${
        args.name
    } -c ${getCurrentDb('name')}`;
    if (args.dir) command = `${command} -d ${args.dir}`;
    if (args.pretty) command = `${command} -p`;
    exec(command);
};
