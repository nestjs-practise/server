import { BaseSeeder, databasePath, DataFactory } from '@/core';
import { Article, Category, Comment } from '@/modules/content/entities';
import fs from 'fs';
import { Connection } from 'typeorm';
import {
    articles,
    categories,
    IArticleData,
    ICategoryData,
} from '../fixture/content';

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [Article, Category, Comment];

    protected factory!: DataFactory;

    public async run(
        _factory: DataFactory,
        _connection: Connection,
    ): Promise<any> {
        this.factory = _factory;
        await this.loadCategories(categories);
        await this.loadArticles(articles);
    }

    private getRandomCategories(cates: Category[]) {
        const getRandomIndex = () =>
            Math.floor(Math.random() * Math.floor(cates.length - 1));
        const result: Category[] = [];
        for (let i = 0; i <= getRandomIndex(); i++) {
            const cate = cates[getRandomIndex()];
            if (!result.find((item) => item.id === cate.id)) {
                result.push(cate);
            }
        }
        return result;
    }

    private async loadCategories(
        data: ICategoryData[],
        parent?: Category,
    ): Promise<void> {
        for (const item of data) {
            const category = new Category();
            category.name = item.name;
            if (parent) category.parent = parent;
            await this.em.save(category);
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    private async loadArticles(data: IArticleData[]) {
        const allCates = await this.em.find(Category);
        for (const item of data) {
            const article = new Article();
            article.title = item.title;
            // // if (article.summary) Article.summary = article.summary;
            const contentPath = databasePath(
                `fixture/blog/article-confile-file/${item.contentFile}`,
            );
            article.body =
                fs.existsSync(contentPath) && fs.statSync(contentPath).isFile()
                    ? fs.readFileSync(contentPath, 'utf8')
                    : '';
            article.isPublished = Math.random() >= 0.5;
            article.categories = this.getRandomCategories(allCates);
            await this.em.save(article);
        }
        await this.factory(Article)({
            categories: this.getRandomCategories(allCates),
        }).createMany(10);
    }
}
