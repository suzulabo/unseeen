import { LogStore } from './idb/logstore';

const DB_NAME = 'unseeen-uploadlog.db';
const STORE_NAME = 'uploadlog';

interface UploadLogData {
  destID: string;
  path: string;
  files: { name: string; size: number }[];
}

export class UploadLog {
  private store = new LogStore<UploadLogData>();

  async init() {
    await this.store.open(DB_NAME, STORE_NAME);
  }

  async add(v: UploadLogData) {
    await this.store.add(v);
  }

  async list() {
    return this.store.list();
  }

  async deleteAll() {
    await this.store.deleteDB();
    await this.init();
  }
}
