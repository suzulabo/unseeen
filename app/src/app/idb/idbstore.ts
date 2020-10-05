import { deleteDB, IDBPDatabase, IDBPTransaction, openDB } from 'idb';

export class IDBStore<T> {
  protected db: IDBPDatabase;
  protected storeName: string;

  async open(dbName: string, storeName: string) {
    this.storeName = storeName;
    this.db = await openDB(dbName, 1, {
      upgrade: (db) => {
        this.handleDBUpgrade(db);
      },
    });
  }

  protected handleDBUpgrade(db: IDBPDatabase) {
    db.createObjectStore(this.storeName);
  }

  async close() {
    if (!this.db) {
      return;
    }
    this.db.close();
    this.db = undefined;
    this.storeName = undefined;
  }

  async deleteDB() {
    const dbName = this.db.name;
    await this.close();
    await deleteDB(dbName);
  }

  async exists(key: string) {
    const c = await this.db.transaction(this.storeName).store.openCursor(key);
    return c != null;
  }

  async keys() {
    return (await this.db.getAllKeys(this.storeName)).map((x) => {
      return x as string;
    });
  }

  async get(key: string): Promise<T> {
    return await this.db.get(this.storeName, key);
  }

  transaction() {
    const tasks: ((
      ts: IDBPTransaction<unknown, [string]>
    ) => Promise<unknown>)[] = [];

    return {
      add: (key: string, value: T) => {
        tasks.push((ts) => {
          return ts.store.add(value, key);
        });
      },
      put: (key: string, value: T) => {
        tasks.push((ts) => {
          return ts.store.put(value, key);
        });
      },
      delete: (key: string) => {
        tasks.push((ts) => {
          return ts.store.delete(key);
        });
      },
      commit: async () => {
        const ts = this.db.transaction(this.storeName, 'readwrite');

        await Promise.all(
          tasks.map((f) => {
            return f(ts);
          })
        );

        await ts.done;
      },
    };
  }
}
