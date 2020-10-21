import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const database: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'cms',
    synchronize: true,
    autoLoadEntities: true,
    cli: {
        entitiesDir: 'src/entities',
        subscribersDir: 'src/subscriber',
    },
};
