import { SecureStore } from './securestore';

describe('SecureStore', () => {
  const store = new SecureStore<Uint8Array>();

  beforeAll(async () => {});

  it('read write', async () => {
    await store.open('SecureStore.RW', 'TEST');

    const data = new Uint8Array([1, 2, 3, 4, 5]);

    const tx = store.transaction();
    tx.put('1', await store.encrypt(data));
    tx.put('2', await store.encrypt(data));
    tx.put('3', await store.encrypt(data));
    await tx.commit();
    expect(await store.decrypt(await store.get('1'))).toEqual(data);
    expect(await store.decrypt(await store.get('2'))).toEqual(data);
    expect(await store.decrypt(await store.get('3'))).toEqual(data);
  });
});
