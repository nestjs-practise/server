/*
 * Description  : Bcrypt加密与验证工具
 * Author       : lichnow
 * Homepage     : https://gkr.io
 * My Blog      : https://lichnow.com
 * Date         : 2020-03-02 04:20:06 +0800
 * LastEditTime : 2020-10-24 06:58:42 +0800
 * Licensed     : MIT
 */
import bcrypt from 'bcrypt';
import { BaseUtil, IConfigMaps } from './base';

/**
 * Bcrypt密码设置
 *
 * @export
 * @class HashUtil
 */
export class Hash extends BaseUtil<number> {
    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'app.hash',
    };

    create(config: number) {
        this.config = config;
    }

    /**
     * 加密明文密码
     *
     * @param {string} password
     * @returns
     * @memberof HashUtil
     */
    encry(password: string) {
        return bcrypt.hashSync(password, this.config);
    }

    /**
     * 验证密码
     *
     * @param {string} password
     * @param {string} hashed
     * @returns
     * @memberof HashUtil
     */
    check(password: string, hashed: string) {
        return bcrypt.compareSync(password, hashed);
    }
}
