import { encSecretKey, genID, decSecretKey } from './keys';

describe('keys', () => {
  it('secretKey', async () => {
    const id = genID();
    const password = 'password';
    const enc = encSecretKey(id.pair.secretKey, password);
    const dec = decSecretKey(enc, password);
    expect(dec).toEqual(id.pair.secretKey);
  });
});
