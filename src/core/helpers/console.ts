import chalk from 'chalk';
import ora from 'ora';
import shell from 'shelljs';

/**
 * 命令行打应错误
 */
export const printError = (message: string, error?: any) => {
    // tslint:disable-next-line
    console.log('\n❌ ', chalk.red(message));
    if (error) {
        // tslint:disable-next-line
        console.error(error);
    }
};

/**
 * 命令行抛出异常并终止运行
 *
 * @param spinner
 * @param error
 * @param message
 */
export const panic = (spinner: ora.Ora, message: string, error?: Error) => {
    spinner.fail(message);
    if (error) console.error(error);
    process.exit(1);
};

export const exec = (command: string) => {
    shell.exec(
        command,
        { async: true, silent: true },
        (code, stdout, stderr) => {
            console.log('\n');
            console.log(stderr ? chalk.red(stdout) : chalk.green(stdout));
            if (stderr) {
                console.log(chalk.red(stderr));
                console.log(chalk.red('\n❌ Generate migration failed!'));
            } else {
                console.log(
                    '👍 ',
                    chalk.greenBright.underline('Finished generate migration'),
                );
            }
            process.exit(0);
        },
    );
};
