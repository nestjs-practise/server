import { AppConfig } from '../interface';

export const DefaultAppConfig: AppConfig = {
    timezone: 'UTC',
    locale: 'en',
    debug: true,
    port: 3000,
    host: 'localhost',
    https: false,
    hash: 10,
};
