import { AppConfig, ConfigRegister, env } from '@/core';

export const app: ConfigRegister<AppConfig> = () => ({
    debug: env('APP_DEBUG', (v) => JSON.parse(v), true),
    timezone: env('APP_TIMEZONE', 'Asia/Shanghai'),
    locale: env('APP_LOCALE', 'zh-cn'),
    port: env<number>('API_PORT', (v) => Number(v), 3000),
    hash: env<number>('PASSWORD_HASH', (v) => Number(v), 10),
    https: env<boolean>('API_HTTPS', (v) => JSON.parse(v), false),
    host: env('API_HOST', 'localhost'),
    url: env('API_URL', undefined),
});
