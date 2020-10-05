import { nacl, toBase32 } from '@common';
import { wait } from './utils';

const DEFAULT_CHUNK_SIZE = 1024 * 1024;

const incNonce = (nonce: Uint8Array) => {
  for (let n = 0; n <= 1; n++) {
    nonce[n]++;
    if (nonce[n]) {
      break;
    }
  }
};
const lastNonce = (nonce: Uint8Array) => {
  nonce[1] |= 0x80;
};

const encrypting = new Set<string>();

export const abortEncrypt = async (_key: ArrayBuffer) => {
  encrypting.delete(toBase32(new Uint8Array(_key)));
};

export const workerEncrypt = async (
  _key: ArrayBuffer,
  _data: ArrayBuffer,
  cb?: (val: number) => void,
  _chunkSize?: number
) => {
  const key = new Uint8Array(_key);
  const keyS = toBase32(key);
  encrypting.add(keyS);
  try {
    const data = new Uint8Array(_data);
    const chunkSize = _chunkSize || DEFAULT_CHUNK_SIZE;

    const nonce = new Uint8Array(nacl.secretbox.nonceLength);
    nonce.fill(0, 0, 2);
    nonce.set(nacl.randomBytes(nacl.secretbox.nonceLength - 2), 2);

    const chunkCount = Math.ceil(data.byteLength / chunkSize);
    const result = new Uint8Array(
      1 +
        (nonce.byteLength - 2) +
        data.byteLength +
        nacl.secretbox.overheadLength * chunkCount
    );

    result.set([1], 0); // format version
    result.set(nonce.subarray(2), 1);
    const startPos = 1 + nonce.byteLength - 2;

    for (let i = 0; i < chunkCount; i++) {
      const pos = i * chunkSize;
      if (cb) {
        cb(pos);
        await wait(1);
      }
      if (!encrypting.has(keyS)) {
        return null;
      }
      const chunk = data.subarray(pos, pos + chunkSize);
      if (i == chunkCount - 1) {
        lastNonce(nonce);
      }
      result.set(
        nacl.secretbox(chunk, nonce, key),
        startPos + (chunkSize + nacl.secretbox.overheadLength) * i
      );
      incNonce(nonce);
    }

    return result;
  } finally {
    encrypting.delete(keyS);
  }
};

export const workerDecrypt = async (
  _key: ArrayBuffer,
  _data: ArrayBuffer,
  cb?: (val: number) => void,
  _chunkSize?: number
) => {
  const key = new Uint8Array(_key);
  const data = new Uint8Array(_data);
  const chunkSize = _chunkSize || DEFAULT_CHUNK_SIZE;
  const secretChunkSize = chunkSize + nacl.secretbox.overheadLength;

  if (data[0] != 1) {
    throw TypeError('invalid version');
  }
  const nonce = new Uint8Array(nacl.secretbox.nonceLength);
  nonce.fill(0, 0, 2);
  nonce.set(data.subarray(1, 1 + nacl.secretbox.nonceLength - 2), 2);

  const startPos = 1 + nonce.byteLength - 2;
  const chunkCount = Math.ceil((data.byteLength - startPos) / secretChunkSize);
  const remain =
    (data.byteLength - startPos) % secretChunkSize || secretChunkSize;

  const result = new Uint8Array(
    (chunkCount - 1) * chunkSize + (remain - nacl.secretbox.overheadLength)
  );

  for (let i = 0; i < chunkCount; i++) {
    const pos = startPos + i * secretChunkSize;
    if (cb) {
      cb(pos);
    }
    const chunk = data.subarray(pos, pos + secretChunkSize);
    if (i == chunkCount - 1) {
      lastNonce(nonce);
    }
    const x = nacl.secretbox.open(chunk, nonce, key);
    if (!x) {
      return null;
    }
    result.set(x, chunkSize * i);
    incNonce(nonce);
  }

  return result;
};
