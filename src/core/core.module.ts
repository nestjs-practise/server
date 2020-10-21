import { database } from '@/config';
import { routes } from '@/config/routes.config';
import { Global, Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from 'nest-router';
import { DtoValidationPipe } from './pipes';

const providers = [
    {
        provide: APP_PIPE,
        useFactory: () =>
            new DtoValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
    },
];
@Global()
@Module({
    imports: [TypeOrmModule.forRoot(database), RouterModule.forRoutes(routes)],
    providers,
})
export class CoreModule {}
