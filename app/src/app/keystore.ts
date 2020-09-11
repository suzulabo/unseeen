import { SecureStore } from './idb/securestore';
import { decSecretKey, encSecretKey } from './keys';
import { binToStr, strToBin } from './utils';

const DB_NAME = 'unseeen-keys.db';
const STORE_NAME = 'keys';
const KEY = {
  ID: 'id',
  SECRET: 'secret',
  SUBKEYS: 'subkeys',
} as const;

type SubKeys = {
  [key: string]: { key: Uint8Array; expired?: number };
};

export class KeyStore {
  private store = new SecureStore<Uint8Array | SubKeys>();

  async init() {
    await this.store.open(DB_NAME, STORE_NAME);
    await this.deleteExpiredSubKeys();
  }

  async saveKey(id: string, secretKey: Uint8Array, password: string) {
    const secret = encSecretKey(secretKey, password);
    const tx = this.store.transaction();
    tx.put(KEY.ID, await this.store.encrypt(strToBin(id)));
    tx.put(KEY.SECRET, await this.store.encrypt(secret));
    await tx.commit();
  }

  async getID() {
    const v = (await this.store.get(KEY.ID)) as Uint8Array;
    if (v) {
      return binToStr(await this.store.decrypt(v));
    }
  }

  async getSecret(password: string) {
    const v = (await this.store.get(KEY.SECRET)) as Uint8Array;
    if (v) {
      return decSecretKey(await this.store.decrypt(v), password);
    }
  }

  async saveSubKeys(keys: { id: string; key: Uint8Array }[]) {
    const subKeys = ((await this.store.get(KEY.SUBKEYS)) || {}) as SubKeys;
    const result = [] as typeof keys;

    for (const key of keys) {
      if (key.id in subKeys) {
        continue;
      }
      subKeys[key.id] = { key: await this.store.encrypt(key.key) };
      result.push(key);
    }

    const tx = this.store.transaction();
    tx.put(KEY.SUBKEYS, subKeys);
    await tx.commit();

    return result;
  }

  async updateSubKeysExpired(actives: string[], expired: number) {
    const subKeys = ((await this.store.get(KEY.SUBKEYS)) || {}) as SubKeys;

    for (const [k, v] of Object.entries(subKeys)) {
      if (actives.indexOf(k) < 0 && !v.expired) {
        v.expired = expired;
      }
    }

    const tx = this.store.transaction();
    tx.put(KEY.SUBKEYS, subKeys);
    await tx.commit();
  }

  async getSubKey(id: string) {
    const subKeys = ((await this.store.get(KEY.SUBKEYS)) || {}) as SubKeys;
    const k = subKeys[id]?.key;
    if (k) {
      return await this.store.decrypt(k);
    }
  }

  async deleteExpiredSubKeys() {
    const subKeys = ((await this.store.get(KEY.SUBKEYS)) || {}) as SubKeys;
    const now = new Date().getTime();
    let deleted = false;
    const newSubKeys = Object.entries(subKeys)
      .filter(([_, v]) => {
        if (v.expired < now) {
          deleted = true;
          return false;
        }
        return true;
      })
      .reduce((o, [k, v]) => {
        o[k] = v;
        return o;
      }, {});

    if (deleted) {
      const tx = this.store.transaction();
      tx.put(KEY.SUBKEYS, newSubKeys);
      await tx.commit();
    }
  }

  async deleteAll() {
    await this.store.deleteDB();
    await this.init();
  }
}
