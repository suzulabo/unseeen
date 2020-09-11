import { IDBPDatabase } from 'idb';
import { IDBStore } from './idbstore';

const KEY_STORE = '__key';
const KEY_INDEX = '__key';

const browserCrypt = (() => {
  const IV_LEN = 12;

  const genKey = async () => {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encrypt = async (
    key: CryptoKey,
    data: Uint8Array
  ): Promise<Uint8Array> => {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const d = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      data
    );

    const encrypted = new Uint8Array(d);
    const result = new Uint8Array(iv.length + encrypted.length);
    result.set(iv);
    result.set(encrypted, iv.length);
    return result;
  };

  const decrypt = async (key: CryptoKey, encrypted: Uint8Array) => {
    const iv = encrypted.slice(0, IV_LEN);
    const data = encrypted.slice(IV_LEN, encrypted.length);
    const d = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      data
    );
    return new Uint8Array(d);
  };

  return { genKey: genKey, encrypt: encrypt, decrypt: decrypt };
})();

export class SecureStore<T> extends IDBStore<T> {
  private key: CryptoKey;

  protected handleDBUpgrade(db: IDBPDatabase) {
    super.handleDBUpgrade(db);
    db.createObjectStore(KEY_STORE);
  }

  async open(dbName: string, storeName: string) {
    await super.open(dbName, storeName);

    const key = (await this.db.get(KEY_STORE, KEY_INDEX)) as CryptoKey;
    if (key) {
      this.key = key;
    } else {
      this.key = await browserCrypt.genKey();
      await this.db.put(KEY_STORE, this.key, KEY_INDEX);
    }
  }

  async encrypt(value: Uint8Array) {
    return await browserCrypt.encrypt(this.key, value);
  }

  async decrypt(value: Uint8Array) {
    return browserCrypt.decrypt(this.key, value);
  }
}
