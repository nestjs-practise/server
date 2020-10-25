// import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
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
export type DbCliOptions = ConnectionOptions & {};

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
