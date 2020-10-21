import { Module } from '@nestjs/common';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { SecurityModule } from './security/security.module';

@Module({
    imports: [CoreModule, SecurityModule, ContentModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
