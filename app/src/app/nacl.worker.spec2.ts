import { nacl } from '@common';
import { workerDecrypt, workerEncrypt } from './nacl.worker';

describe('nacl.worker', () => {
  const encAndDec = async (
    dataSize: number,
    chunkSize: number,
    cbCount: number
  ) => {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    const data = nacl.randomBytes(dataSize);
    let cb = 0;
    const enc = await workerEncrypt(
      key.buffer,
      data.buffer,
      async () => {
        cb++;
      },
      chunkSize
    );
    expect(cb).toEqual(cbCount);
    expect(enc).not.toBeNull();

    cb = 0;
    const dec = await workerDecrypt(
      key.buffer,
      enc.buffer,
      () => {
        cb++;
      },
      chunkSize
    );
    expect(cb).toEqual(cbCount);
    expect(dec).toEqual(data);
  };

  it('basic', async () => {
    await encAndDec(100, null, 1);
  });

  it('just', async () => {
    await encAndDec(200, 100, 2);
  });

  it('remain', async () => {
    await encAndDec(250, 100, 3);
  });

  it('lots of chunks', async () => {
    await encAndDec(10000, 10, 1000);
  });

  /*
  it('enc abort', async () => {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    const data = nacl.randomBytes(1000);
    let cb = 0;
    const enc = await workerEncrypt(
      key.buffer,
      data.buffer,
      async () => {
        cb++;
        return cb > 5;
      },
      100
    );
    expect(cb).toEqual(6);
    expect(enc).toBeNull();
  });

  it('dec abort', async () => {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    const data = nacl.randomBytes(1000);
    const enc = await workerEncrypt(key.buffer, data.buffer, null, 100);
    let cb = 0;
    const dec = await workerDecrypt(
      key.buffer,
      enc.buffer,
      () => {
        cb++;
        return cb > 5;
      },
      100
    );
    expect(cb).toEqual(6);
    expect(dec).toBeNull();
  });
  */
});
