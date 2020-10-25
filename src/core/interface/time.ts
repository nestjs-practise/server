import dayjs from 'dayjs';
/** ****************************************** Time Util **************************************** */
/**
 * 时间生成器参数接口
 */
export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}
