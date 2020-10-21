import { database } from '@/config';
import { omit } from 'lodash';
import { ConnectionOptions } from 'typeorm';

const TypeormConfig: ConnectionOptions = omit(database, [
    'retryAttempts',
    'retryDelay',
    'toRetry',
    'autoLoadEntities',
    'keepConnectionAlive',
    'verboseRetryLog',
]) as ConnectionOptions;
export default TypeormConfig;
