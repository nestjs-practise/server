import { defineFactory } from '@/core';
import { Article, Category } from '@/modules/content/entities';
import Faker from 'faker';

defineFactory(
    Article,
    (faker: typeof Faker, data?: { categories: Category[] }) => {
        faker.setLocale('zh_CN');
        const article = new Article();
        article.title = faker.lorem.sentence(
            Math.floor(Math.random() * (15 - 6 + 1)) + 6,
        );
        article.body = faker.lorem.paragraph(
            Math.floor(Math.random() * (15 - 6 + 1)) + 6,
        );
        article.isPublished = Math.random() >= 0.5;
        if (data) {
            article.categories = data.categories;
        }
        return article;
    },
);
