import { IdenaProvider } from 'idena-sdk-js';
import { APP_CONFIG } from '../app.config';
const IDENA_CONF = APP_CONFIG.idena;

const idenaProvider = IdenaProvider.create(IDENA_CONF.rpcUrl, IDENA_CONF.apiKey);

export default idenaProvider
