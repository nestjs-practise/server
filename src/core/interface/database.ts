// import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Faker from 'faker';
import ora from 'ora';
import { Connection, ConnectionOptions, ObjectType } from 'typeorm';
import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
import { EntityFactory } from '../utils/factory';
/**
 * 用于配置文件中的数据库链接配置
 */
export type DbConnectionConfig = DbOptionCollection & DbAdditional;

/**
 * 各种类型的数据库连接都适用的联合类型,以下配置都符合此类型
 * 原生typeorm的配置
 * 自定义cli命令行时增加的配置
 * Nestjs typeorm module增加的配置
 * 数据库配置文件的类型
 */
export type DbOptions =
    | ConnectionOptions
    | DbCliOptions
    | DbModuleOptions
    | DbOptionCollection;

/**
 * 用于Nest Typeorm Module的配置
 */
export type DbModuleOptions = TypeOrmModuleOptions;

/**
 * 运行自定义CLI命令时的数据库连接配置
 */
export type DbCliOptions = ConnectionOptions & {
    readonly factories?: string[];
    readonly seeds?: string[];
};

/**
 * 同时包含自定义CLI和Nest Typeorm Module的数据库配置的交叉类型
 */
export type DbOptionCollection = DbCliOptions & DbModuleOptions;

/**
 * 只用于配置文件的额外配置
 */
export interface DbAdditional {
    entities?: BaseConnectionOptions['entities'];
    subscribers?: BaseConnectionOptions['subscribers'];
}

/** ****************************************** CLI接口 **************************************** */
/**
 * CLI RESET DB命令参数
 */
export interface DbRefreshArguments {
    connection?: string;
    seed: boolean;
}

/**
 * CLI Seed命令参数
 */
export interface SeedArguments {
    connection?: string;
    class?: string;
    forceInit?: boolean;
}

/**
 * Seeder类接口
 */
export interface Seeder {
    load: (factory: DataFactory, connection: Connection) => Promise<void>;
}

/**
 * Seeder类构造器接口
 */
export type SeederConstructor = new (
    seeders: SeederConstructor[],
    spinner: ora.Ora,
    args: SeedArguments,
) => Seeder;

/**
 * factory函数的接口
 */
export interface EntityFactoryDefinition<Entity, Settings> {
    entity: ObjectType<Entity>;
    factory: DataFactoryFunction<Entity, Settings>;
}

/**
 * factory回调函数接口
 */
export type DataFactoryFunction<Entity, Settings> = (
    faker: typeof Faker,
    settings?: Settings,
) => Entity;

export type EntityProperty<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};

/**
 *  获取entity映射的factory的函数接口
 */
export type DataFactory = <Entity, Settings>(
    entity: ObjectType<Entity>,
) => (settings?: Settings) => EntityFactory<Entity, Settings>;
