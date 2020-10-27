/* eslint-disable global-require */
import glob from 'glob';
import path from 'path';
/**
 * glob路径配置获取合并后的所有文件
 * @param filePattern
 * @param absolute // 是否绝对路径
 */
export const matchGlobs = (
    filePattern: string[],
    options: glob.IOptions = {},
    cwd?: boolean,
): string[] => {
    return filePattern
        .map((pattern) => {
            return cwd
                ? glob
                      .sync(pattern, options)
                      .map((file) => path.resolve(process.cwd(), file))
                : glob.sync(pattern, options);
        })

        .reduce((acc, filePath) => [...acc, ...filePath]);
};

/**
 * require一个文件并获取其导出的default对象
 *
 * @export
 * @template T
 * @param {string} filePath
 * @returns {T}
 */
export const requireDefault = <T>(filePath: string): T => {
    const fileObject: {
        [key: string]: T;
    } = require(filePath);
    const keys = Object.keys(fileObject);
    return fileObject[keys[0]];
};

/**
 * 动态require文件
 *
 * @export
 * @param {string[]} filePaths
 * @returns
 */
export const requirePaths = (filePaths: string[]) => filePaths.forEach(require);
