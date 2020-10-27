/*
 * Description  : ORM事件监听器基类
 * Author       : lichnow
 * Homepage     : https://gkr.io
 * My Blog      : https://lichnow.com
 * Date         : 2020-03-07 01:35:20 +0800
 * LastEditTime : 2020-10-27 20:45:50 +0800
 * Licensed     : MIT
 */

import {
    Connection,
    EntityManager,
    EntitySubscriberInterface,
    EventSubscriber,
    getConnection,
    ObjectType,
    UpdateEvent,
} from 'typeorm';
import { getCurrentDb } from '../helpers';
// import { Optional, Inject } from '@nestjs/common';

/**
 * 插件(包括应用插件)中的监听器如果需要注入服务则需要继承此类
 *
 * @export
 * @abstract
 * @class BaseSubscriber
 * @implements {EntitySubscriberInterface<T>}
 * @template T
 */
@EventSubscriber()
export abstract class BaseSubscriber<T>
    implements EntitySubscriberInterface<T> {
    protected em!: EntityManager;

    /**
     * 如果有自动注入的连接实例则属于Nestjs运行时否则处于cli状态
     * @memberof BaseSubscriber
     */
    constructor(protected connection?: Connection) {
        if (this.connection) {
            this.connection.subscribers.push(this);
        } else {
            this.connection = getConnection(getCurrentDb('name'));
        }
        this.em = this.connection.manager;
    }

    abstract listenTo(): ObjectType<T>;

    protected isUpdated<E>(cloumn: keyof E, event: UpdateEvent<E>) {
        return event.updatedColumns.find(
            (item) => item.propertyName === cloumn,
        );
    }
}
