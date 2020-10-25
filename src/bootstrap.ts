import { Database } from '@/core';
import { Module } from '@nestjs/common';
import * as configs from './config';
import { CoreModule } from './core';
import { ContentModule } from './modules/content/content.module';
import { SecurityModule } from './modules/security/security.module';
import { routes } from './routes';

@Module({
    imports: [
        CoreModule.forRoot(configs, { routes, enabled: [Database] }),
        SecurityModule,
        ContentModule,
    ],
    controllers: [],
    providers: [],
})
export class Bootstrap {}
