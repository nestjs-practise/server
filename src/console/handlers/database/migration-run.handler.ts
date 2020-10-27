import { exec, getCurrentDb } from '@/core';
import { getTypeorm } from './typeorm';

export const MigrationRunHandler = async (args: any) => {
    const typeCommand = await getTypeorm(args);
    let command = `${typeCommand} migration:run -c ${getCurrentDb('name')}`;
    if (args.transaction) command = `${command} -t ${args.transaction}`;
    exec(command);
};
