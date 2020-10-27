import chalk from 'chalk';
import ora from 'ora';
import { Connection, ObjectType } from 'typeorm';
import { DbOptionsType } from '../constants';
import { Gkr } from '../gkr';
import {
    DataFactory,
    DataFactoryFunction,
    DbOptions,
    EntityFactoryDefinition,
    SeedArguments,
    Seeder,
    SeederConstructor,
} from '../interface';
import { Database } from '../utils';
import { EntityFactory } from '../utils/factory';
import { panic } from './console';

const db = () => Gkr.util.get(Database);

/* eslint-disable no-return-assign */
// -------------------------------------------------------------------------
// 工具函数
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// 全局变量用于存储当前数据库连接及当前连接的factories文件
// -------------------------------------------------------------------------
(global as any).db = {
    name: 'default',
    connection: undefined,
    entityFactories: new Map<string, EntityFactoryDefinition<any, any>>(),
};

export async function makeCurrentDb(name: string, spinner?: ora.Ora) {
    try {
        const successed = 'Database connected';
        setCurrentDb({ name });
        const connection = await makeConnect(name);
        setCurrentDb({ connection });
        spinner
            ? spinner.succeed(successed)
            : console.log(chalk.green(successed));
    } catch (error) {
        const failed = `Database connection failed! Connection which named ${name} can not be connect`;
        spinner
            ? panic(spinner, failed, error)
            : console.log(chalk.red(failed));
        process.exit(0);
    }
}

// ------------------------------ 设置当前连接及当前连接的名称 ------------------------------ //

export function setCurrentDb(data: {
    name?: string;
    connection?: Connection;
}): void {
    if (data.name) (global as any).db.name = data.name;
    if (data.connection) (global as any).db.connection = data.connection;
}

export function getCurrentDb(type?: 'name' | 'connection') {
    const { db: cdb } = global as any;
    if (!type) return cdb;
    return type === 'name' ? cdb.name : cdb.connection;
}

/**
 * 获取一个类型的所有数据库连接配置
 * 默认为Typeorm原始连接类型
 *
 * @export
 * @param {DbOptionsType} [type]
 * @returns {DbOptions[]}
 */
export function dbConfigs(type?: DbOptionsType): DbOptions[] {
    return db().getOptions(type);
}

/**
 * 通过连接名与类型获取此连接的数据库配置
 *
 * @export
 * @param {string} [name]
 * @param {DbOptionsType} [type]
 * @returns {DbOptions}
 */
export function dbConfig(name?: string, type?: DbOptionsType): DbOptions {
    return db().getOption(name, type);
}

/**
 * 获取所有数据库连接名
 *
 * @export
 * @returns {string[]}
 */
export function dbNames(): string[] {
    return db().names;
}

export function defaultDbName() {
    return db().default;
}

export async function makeConnect(name?: string): Promise<Connection> {
    return await db().createConnection(name);
}

/**
 * 获取Entity类名
 *
 * @export
 * @template T
 * @param {ObjectType<T>} entity
 * @returns {string}
 */
export function entityName<T>(entity: ObjectType<T>): string {
    if (entity instanceof Function) {
        return entity.name;
    }
    if (entity) {
        return new (entity as any)().constructor.name;
    }
    throw new Error('Enity is not defined');
}

/**
 * 重置外键
 *
 * @export
 * @param {Connection} connection
 * @param {boolean} [enabled=true]
 * @returns {Promise<Connection>}
 */
export async function foreignKey(
    connection: Connection,
    enabled = true,
): Promise<Connection> {
    return await db().resetForeignKey(connection, enabled);
}

/**
 * 定义factory,绑定Entiy类名
 * factoryFn自动注入faker.js对象
 *
 * @param entity
 * @param factoryFn
 */
export const defineFactory = <Entity, Settings>(
    entity: ObjectType<Entity>,
    factoryFn: DataFactoryFunction<Entity, Settings>,
) => {
    (global as any).db.entityFactories.set(entityName(entity), {
        entity,
        factory: factoryFn,
    });
};

/**
 * factory函数,使用高阶包装
 * ObjectType通过new (): T用于从类生成接口类型
 *
 * @param entity
 */
export const factory: DataFactory = <Entity, Settings>(
    entity: ObjectType<Entity>,
) => (settings?: Settings) => {
    const name = entityName(entity);
    const entityFactoryObject = (global as any).db.entityFactories.get(name);
    return new EntityFactory<Entity, Settings>(
        name,
        entity,
        entityFactoryObject.factory,
        settings,
    );
};

/**
 * 运行seeder
 *
 * @param Clazz
 */
export const runSeeder = async (
    Clazz: SeederConstructor,
    seeders: SeederConstructor[],
    args: SeedArguments,
    spinner: ora.Ora,
): Promise<void> => {
    const seeder: Seeder = new Clazz(seeders, spinner, args);
    // 运行seed er的'run'方法并注入factory和当前连接
    return await seeder.load(factory, getCurrentDb('connection'));
};
