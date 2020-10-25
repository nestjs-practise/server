import { DbAdditional, DbConnectionConfig } from './database';

export type ConfigRegister<T> = () => T;

export type ConfigRegCollection<T> = {
    [P in keyof T]?: () => T[P];
};

export interface BaseConfig {
    app: AppConfig;
    [key: string]: any;
}

/** ****************************************** APP配置 **************************************** */
export interface AppConfig {
    debug: boolean;
    timezone: string;
    locale: string;
    port: number;
    https: boolean;
    host: string;
    hash: number;
    url?: string;
}

/**
 * 用于配置文件的数据库配置
 */
export interface DbConfig {
    default: string;
    enabled: string[];
    connections: DbConnectionConfig[];
    common: DbAdditional & {
        [key: string]: any;
    };
}
