#!/usr/bin/env NODE_ENV=development node
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable global-require */
import * as configs from '@/config';
import { Database, Gkr, panic } from '@/core';
import ora from 'ora';
import yargs from 'yargs';

const spinner = ora('Startup the framework..').start();

try {
    Gkr.init(configs).util.add(Database);
    spinner.succeed('Framework been started');
} catch (error) {
    panic(spinner, 'Startup framework failed.', error);
}
yargs
    .usage('Usage: $0 <command> [options]')
    .commandDir('commands', {
        extensions: ['js', 'ts'],
    })
    .demandCommand(1)
    .strict()
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help').argv;
