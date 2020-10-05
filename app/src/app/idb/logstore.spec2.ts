import { LogStore } from './logstore';

describe('LogStore', () => {
  it('read write', async () => {
    const store = new LogStore<string>();
    await store.open('LogStore.RW', 'TEST');

    for (let i = 0; i < 10; i++) {
      await store.add(`${i + 1}`);
    }

    const l1 = await store.list(undefined, 5);
    expect(l1.length).toEqual(5);
    expect(l1[0].value).toEqual('10');
    expect(l1[4].value).toEqual('6');
    const l2 = await store.list(l1[4].key, 10);
    expect(l2.length).toEqual(5);
    expect(l2[0].value).toEqual('5');
    expect(l2[4].value).toEqual('1');
  });
});
