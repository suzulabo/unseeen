import { Crypto } from '@peculiar/webcrypto';
import 'fake-indexeddb/auto';

global['crypto'] = new Crypto();
