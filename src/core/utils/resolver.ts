import { ClassesType, ClassType } from '../interface';
import { BaseUtil } from './base';
import { configure } from './configure';
import { UtilCollection } from './types';

export class UtilResolver {
    protected _utils: UtilCollection = [];

    get all() {
        return this._utils;
    }

    add<T extends BaseUtil<CT>[], CT>(...enabled: ClassesType<T>) {
        for (const Item of enabled) {
            const util = new Item();
            util.factory(configure);
            this._utils.push({ provide: Item, useValue: util });
        }
        return this;
    }

    provider<T extends BaseUtil<CT>, CT>(name: ClassType<T>) {
        return this._utils.find((item) => item.provide === name);
    }

    get<T extends BaseUtil<CT>, CT>(name: ClassType<T>): T {
        const provider = this.provider(name);
        return provider?.useValue as T;
    }

    has<T extends BaseUtil<CT>, CT>(name: ClassType<T>) {
        const provider = this.provider(name);
        return !!provider;
    }
}
