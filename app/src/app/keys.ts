import { makeShortID, nacl, toBase32 } from '@common';
import { concatArray, strToBin } from './utils';

export const genID = () => {
  const pair = nacl.sign.keyPair();
  const id = makeShortID(toBase32(pair.publicKey));
  return {
    id: id,
    pair: pair,
  };
};

export const encSecretKey = (signSecretKey: Uint8Array, password: string) => {
  const key = nacl.hash(strToBin(password)).slice(0, nacl.secretbox.keyLength);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const secret = nacl.secretbox(signSecretKey, nonce, key);
  return concatArray(nonce, secret);
};

export const decSecretKey = (v: Uint8Array, password: string) => {
  const key = nacl.hash(strToBin(password)).slice(0, nacl.secretbox.keyLength);
  const nonce = v.slice(0, nacl.secretbox.nonceLength);
  const secret = v.slice(nacl.secretbox.nonceLength);
  return nacl.secretbox.open(secret, nonce, key);
};
