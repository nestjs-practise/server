import { ContentModule } from '@/content/content.module';
import { Routes } from 'nest-router';

export const routes: Routes = [
    {
        path: '/content',
        module: ContentModule,
    },
];
