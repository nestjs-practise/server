/*
 * Description  : 数据库操作
 * Author       : lichnow
 * Homepage     : https://gkr.io
 * My Blog      : https://lichnow.com
 * Date         : 2020-03-01 23:19:16 +0800
 * LastEditTime : 2020-10-27 08:12:01 +0800
 * Licensed     : MIT
 */

import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import merge from 'deepmerge';
import { omit } from 'lodash';
import { Connection, ConnectionOptions, getConnectionManager } from 'typeorm';
import { DbOptionsType } from '../constants';
import {
    DbCliOptions,
    DbConfig,
    DbModuleOptions,
    DbOptionCollection,
    DbOptions,
} from '../interface';
import { BaseUtil, IConfigMaps } from './base';

/**
 * 数据库工具类
 *
 * @export
 * @class DatabaseUtil
 */
export class Database extends BaseUtil<DbOptionCollection[]> {
    static subscribers: any[] = [];

    /**
     * 除默认连接配置字段外的自定义字段
     * nest为nest-typeorm模块的可配置字段
     * cli为执行cli命令是可配置的字段
     *
     * @private
     * @memberof DatabaseUtil
     */
    private readonly customFields = {
        nest: [
            'retryAttempts',
            'retryDelay',
            'autoLoadEntities',
            'keepConnectionAlive',
        ],
        cli: ['seeds', 'factories'],
    };

    // protected subscribers: Function[] = [];

    protected configMaps: IConfigMaps = {
        required: true,
        maps: 'database',
    };

    protected _default!: string;

    protected _names: string[] = [];

    create(config: DbConfig) {
        // 如果没有配置默认数据库则抛出异常
        if (!config.default) {
            throw new Error('default connection name should been config!');
        }
        // 只把启用的数据库配置写入this.config
        // 数据库配置名必须填写,没有数据库配置名的直接略过
        this.config = config.connections
            .filter((connect) => {
                if (!connect.name) return false;
                if (config.default === connect.name) return true;
                return config.enabled.includes(connect.name);
            })
            .map(
                (connect) =>
                    merge(config.common, connect) as DbOptionCollection,
            );
        // 把启用的数据库配置名写入this.names
        this.config.forEach((connect) => this._names.push(connect.name!));
        this._default = config.default;
        // 如果启用的数据库配置名中不包含默认配置名则抛出异常
        if (!this._names.includes(this._default)) {
            throw new Error(
                `Default connection named ${this._default} not exists!`,
            );
        }
    }

    // forSubscribers(subscribers: Function[]) {
    //     this.subscribers = [...this.subscribers, ...subscribers];
    // }

    /**
     * 获取默认数据库配置名称
     *
     * @returns
     * @memberof Database
     */
    get default() {
        return this._default;
    }

    /**
     * 获取所有数据库配置名
     *
     * @returns
     * @memberof Database
     */
    get names() {
        return this._names;
    }

    /**
     * 获取一个类型的所有数据库连接
     * 有4种类型可供选择
     * cli用于运行自定义CLI命令，自带seeder等类型
     * nest用于配置nest框架的typeorm模块
     * connection用于数据库连接
     * config则从配置池中加载所有配置
     * 默认获取connection类型的配置
     *
     * @param {DbOptionsType} [type]
     * @returns {IDbOptions[]}
     * @memberof DatabaseUtil
     */
    getOptions(type?: DbOptionsType): DbOptions[] {
        // 返回原生配置
        if (!type || type === DbOptionsType.CONNECTION) {
            // 去除自定义cli和nestjs的配置获取typeorm的原生配置
            return this.config.map((option) =>
                omit(option, [
                    ...this.customFields.cli,
                    ...this.customFields.nest,
                ]),
            ) as ConnectionOptions[];
        }
        // 返回用于自定义CLI的配置
        if (type === DbOptionsType.CLI) {
            return this.config.map((option) =>
                omit(option, this.customFields.nest),
            ) as DbCliOptions[];
        }
        // 返回用于nestjs连接数据的配置
        // 添加autoLoadEntities
        // 由于entity在autoLoadEntities后自动加载,subscriber由提供者方式注册,所以去除这两者
        if (type === DbOptionsType.NEST) {
            return this.config.map((option) => {
                const all = {
                    ...omit(option, this.customFields.cli),
                    autoLoadEntities: true,
                };
                const { entities, subscribers, ...nestOption } = all;
                if (option.name === this._default) {
                    const { name, ...nameNone } = nestOption;
                    return nameNone;
                }
                return nestOption;
            }) as DbModuleOptions[];
        }
        return this.config;
    }

    /**
     * 获取一个连接的配置，可设置类型
     * name不设置的情况下
     * 如果type是nest则返回没有name的配置
     * 否则返回默认连接的配置
     *
     * @param {string} [name]
     * @param {DbOptionsType} [type]
     * @returns {IDbOptions}
     * @memberof DatabaseUtil
     */
    getOption(name?: string, type?: DbOptionsType): DbOptions {
        let findName: string | undefined = name ?? this._default;

        if (type === DbOptionsType.NEST) {
            findName = name === this._default ? undefined : name;
        }
        const option = this.getOptions(type).find(
            (item) => item.name === findName,
        );
        if (!option) {
            throw new Error(
                `Connection named ${findName}'s option not exists!`,
            );
        }
        return option;
    }

    /**
     * 为Nestjs框架的Tyeporm模块提供数据库连接构造器
     *
     * @returns {DynamicModule[]}
     * @memberof DatabaseUtil
     */
    register(): DynamicModule[] {
        return this.getOptions(DbOptionsType.NEST).map((connection) =>
            TypeOrmModule.forRoot(connection),
        );
    }

    /** ****************************************** CLI方法 **************************************** */

    /**
     * 创建一个临时连接
     * 主要用于CLI操作
     *
     * @param {string} [name]
     * @returns {Promise<Connection>}
     * @memberof DatabaseUtil
     */
    async createConnection(name?: string): Promise<Connection> {
        const option = this.getOption(name);
        return getConnectionManager()
            .create(option as ConnectionOptions)
            .connect();
    }

    /**
     * 关闭外键检测,防止数据注入出错
     *
     * @param {Connection} connection
     * @param {boolean} [enabled=false]
     * @returns {Promise<Connection>}
     * @memberof DatabaseUtil
     */
    async resetForeignKey(
        connection: Connection,
        enabled = true,
    ): Promise<Connection> {
        const { type } = connection.driver.options;
        let key: string;
        let query: string;
        if (type === 'sqlite') {
            key = enabled ? 'OFF' : 'ON';
            query = `PRAGMA foreign_keys = ${key};`;
        } else {
            key = enabled ? '0' : '1';
            query = `SET FOREIGN_KEY_CHECKS = ${key};`;
        }
        await connection.query(query);
        return connection;
    }
}
