import { IDBPDatabase } from 'idb';
import { IDBStore } from './idbstore';

export class LogStore<T> extends IDBStore<T> {
  protected handleDBUpgrade(db: IDBPDatabase) {
    db.createObjectStore(this.storeName, {
      keyPath: 'id',
      autoIncrement: true,
    });
  }

  async add(v: T) {
    await this.db.add(this.storeName, { value: v, time: new Date() });
  }

  async list(from = Number.MAX_SAFE_INTEGER, count = 100) {
    const tx = this.db.transaction(this.storeName);

    let cursor = await tx.store.openCursor(
      IDBKeyRange.upperBound(from, true),
      'prev'
    );
    const result: { key: number; value: T; time: Date }[] = [];
    while (cursor) {
      result.push({
        key: cursor.key as number,
        value: cursor.value.value,
        time: cursor.value.time,
      });
      if (result.length >= count) {
        break;
      }
      cursor = await cursor.continue();
    }
    return result;
  }
}
