import * as configs from '@/config';
import { Database, Gkr } from '@/core';

Gkr.init(configs).util.add(Database);
export default Gkr.util.get(Database).getOptions()[0];
