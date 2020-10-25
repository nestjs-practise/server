import * as utils from '.';
import { ClassType, ValueOf } from '../interface';
import { BaseUtil } from './base';

export interface UtilType<CT> extends BaseUtil<CT> {}
type UtilArrayType<
    T extends ClassType<C>[],
    CT extends any = any,
    C extends UtilType<CT> = UtilType<CT>
> = {
    provide: T[number];
    useValue: C;
}[];

export type UtilItem<CT extends any = any> =
    | ValueOf<typeof utils>
    | ClassType<BaseUtil<CT>>;
export type UtilCollection<CT extends any = any> = UtilArrayType<
    UtilItem<CT>[]
>;
