import crypto from 'crypto';
import {
    Connection,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from 'typeorm';
import { Category } from '../entities';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
    /**
     * 在当前链接中添加
     *
     * @param {Connection} connection
     * @memberof CategorySubscriber
     */
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return Category;
    }

    /**
     * 插入数据前置事件
     *
     * @param {InsertEvent<Category>} event
     * @memberof CategorySubscriber
     */
    async beforeInsert(event: InsertEvent<Category>) {
        if (!event.entity.slug) {
            event.entity.slug = await this.generateUniqueSlug(event);
        }
    }

    /**
     * 为slug生成唯一值
     *
     * @param {InsertEvent<Category>} event
     * @returns {Promise<string>}
     * @memberof CategorySubscriber
     */
    async generateUniqueSlug(event: InsertEvent<Category>): Promise<string> {
        const slug = `gkr_${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
        const category = await event.manager.findOne(Category, {
            slug,
        });
        return !category ? slug : await this.generateUniqueSlug(event);
    }
}
