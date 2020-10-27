/**
 * 判断一个变量是否为promise对象
 *
 * @export
 * @param {*} o
 * @returns {boolean}
 */
export function isPromiseLike(o: any): boolean {
    return (
        !!o &&
        (typeof o === 'object' || typeof o === 'function') &&
        typeof o.then === 'function' &&
        !(o instanceof Date)
    );
}
