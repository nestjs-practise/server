export enum EnviromentType {
    DEV = 'development',
    PROD = 'production',
    TEST = 'test',
}

/**
 * 数据库配置类型
 *
 * @export
 * @enum {number}
 */
export enum DbOptionsType {
    // 用于Typeorm的原生配置
    CONNECTION = 'connection',
    // 用于Nestjs数据库模块
    NEST = 'nest',
    // 用于自定义CLI命令
    CLI = 'cli',
    // 用于配置文件
    CONFIG = 'config',
}

export const DTO_VALIDATION_OPTIONS = 'dto_validation_options';
