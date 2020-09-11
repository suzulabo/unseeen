import {
  fromBase32,
  FunctionParams,
  makeShortID,
  nacl,
  toBase32,
} from '@common';
import { createStore } from '@stencil/store';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { appEnv } from './appenv';
import { Firebase } from './firebase';
import { KeyStore } from './keystore';
import { abortEncrypt, workerDecrypt, workerEncrypt } from './nacl.worker';
import { UploadLog } from './uploadlog';
import { concatArray, readFile, strToBin } from './utils';

const reCaptchaToken = async () => {
  const grecaptcha = window['grecaptcha'];
  try {
    const token = await grecaptcha.execute(appEnv.reCAPTCHASiteKey);
    return token as string;
  } catch (e) {
    console.error('reCaptchaToken error', e);
    throw new Error(`reCaptchaToken error\n${e}`);
  }
};

const { state: appState } = createStore({ userID: '', storedUserID: '' });

interface UploadIndex {
  files: { name: string; size: number; uploadName: string; key: string }[];
}

export class App {
  constructor(
    private firebase = new Firebase(),
    private keyStore = new KeyStore(),
    private uploadLog = new UploadLog()
  ) {}

  get userID() {
    return appState.userID;
  }

  get storedUserID() {
    return appState.storedUserID;
  }

  get ready() {
    return !!appState.userID;
  }

  async init() {
    await Promise.all([
      this.firebase.init(),
      this.keyStore.init(),
      this.uploadLog.init(),
    ]);
    const userID = await this.keyStore.getID();
    if (userID) {
      appState.storedUserID = userID;
      const user = await this.getUser(userID);
      if (user) {
        appState.userID = userID;
      }
    }
  }

  private genSubKeys() {
    const result: nacl.BoxKeyPair[] = [];
    for (let i = 0; i < appEnv.subKeysCount; i++) {
      result.push(nacl.box.keyPair());
    }
    return result;
  }

  async register(id: string, signPair: nacl.SignKeyPair, password: string) {
    const subKeys = this.genSubKeys();
    const token = await reCaptchaToken();
    const result = await this.firebase.callFunctions({
      recaptchaToken: token,
      params: [
        {
          cmd: 'UpdateSubKeys',
          signKey: toBase32(signPair.publicKey),
          subKeys: subKeys.map((v) => {
            return toBase32(nacl.sign(v.publicKey, signPair.secretKey));
          }),
        },
      ],
    });

    if (result.recaptchaError) {
      throw new Error('recaptha error');
    }

    await this.keyStore.saveSubKeys(
      subKeys.map((v) => {
        return {
          id: toBase32(v.publicKey),
          key: v.secretKey,
        };
      })
    );
    await this.keyStore.saveKey(id, signPair.secretKey, password);

    appState.userID = id;

    return true;
  }

  async getUser(userID: string) {
    const user = await this.firebase.getUser(userID);
    if (!user) {
      return;
    }
    const userIDFromData = makeShortID(user.signKey);
    if (userID != userIDFromData) {
      throw new Error(`invalid signKey: ${userID}`);
    }

    const signKey = fromBase32(user.signKey);
    const subKeys = user.subKeys.map((v) => {
      const k = nacl.sign.open(fromBase32(v), signKey);
      if (!k) {
        throw new Error(`invalid subKey: ${userID}/${v}`);
      }
      return k;
    });

    return {
      signKey: signKey,
      subKeys: subKeys,
    } as const;
  }

  async verifyPassword(password: string) {
    const v = await this.keyStore.getSecret(password);
    return !!v;
  }

  async deleteID(password?: string) {
    if (password) {
      const token = await reCaptchaToken();
      const secret = await this.keyStore.getSecret(password);
      if (!secret) {
        throw new Error('invalid password');
      }
      const signKeyPair = nacl.sign.keyPair.fromSecretKey(secret);
      const sign = nacl.sign(strToBin(token), secret);

      const result = await this.firebase.callFunctions({
        recaptchaToken: token,
        params: [
          {
            cmd: 'DeleteID',
            sign: toBase32(sign),
            signKey: toBase32(signKeyPair.publicKey),
          },
        ],
      });
      if (result.recaptchaError) {
        throw new Error('recaptha error');
      }
    }

    await this.keyStore.deleteAll();
    await this.uploadLog.deleteAll();

    appState.userID = '';
    appState.storedUserID = '';
  }

  async encryptFile(file: File, cb: (stage: string, val?: number) => boolean) {
    const data = await readFile(file, (loaded) => {
      return cb('read', loaded);
    });
    if (!data) {
      return;
    }

    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    const encrypted = await workerEncrypt(key, data.buffer, async (val) => {
      if (cb('encrypt', val)) {
        await abortEncrypt(key);
      }
    });

    return { key: key, data: encrypted };
  }

  /*
  async _uploadFiles(
    _userID: string,
    files: {
      file: File;
      uploaded: number;
      encrypted: { key: Uint8Array; data: Uint8Array };
    }[],
    cb: (state: string) => boolean
  ) {
    if (cb('getUser')) {
      return;
    }
    await wait(1000);
    if (cb('callAllowUpload')) {
      return;
    }
    await wait(1000);

    for (let i = 0; i <= 10; i++) {
      for (const f of files) {
        f.uploaded = (f.file.size / 10) * i;
      }
      if (cb('upload')) {
        return;
      }
      await wait(100);
    }

    if (cb('indexFile')) {
      return;
    }
    await wait(1000);

    return 'ABC123456789';
  }
  */

  async uploadFiles(
    userID: string,
    files: {
      file: File;
      uploaded: number;
      encrypted: { key: Uint8Array; data: Uint8Array };
    }[],
    cb: (state: string) => boolean
  ) {
    if (cb('getUser')) {
      return;
    }
    const user = await this.getUser(userID);
    if (!user) {
      return;
    }

    const keyPair = nacl.box.keyPair();
    const destKeys = {
      pubKey: convertPublicKey(user.signKey),
      subKey: user.subKeys[nacl.randomBytes(1)[0] % user.subKeys.length],
    };
    const dh1 = nacl.box.before(destKeys.pubKey, keyPair.secretKey);
    const dh2 = nacl.box.before(destKeys.subKey, keyPair.secretKey);
    const key = nacl
      .hash(concatArray(dh1, dh2))
      .slice(0, nacl.box.sharedKeyLength);

    const nameMap = new Map<string, string>();
    for (const f of files) {
      nameMap.set(f.file.name, toBase32(nacl.randomBytes(7)));
    }

    const path = makeShortID(toBase32(keyPair.publicKey));

    if (cb('callAllowUpload')) {
      return;
    }
    const result = await this.firebase.callFunctions({
      recaptchaToken: await reCaptchaToken(),
      params: [
        {
          cmd: 'AllowUpload',
          destID: userID,
          path: path,
          files: files.map((v) => {
            return {
              name: nameMap.get(v.file.name),
              size: v.encrypted.data.byteLength,
            };
          }),
        },
      ],
    });

    if (result.recaptchaError) {
      throw new Error('recaptcha error');
    }

    const keyMap = new Map<string, typeof files[number]>();
    const index: UploadIndex = {
      files: files.map((f) => {
        const uploadName = nameMap.get(f.file.name);
        const keyS = toBase32(f.encrypted.key);
        keyMap.set(keyS, f);
        return {
          name: f.file.name,
          size: f.file.size,
          uploadName: uploadName,
          key: keyS,
        };
      }),
    };
    index.files.sort((a, b) => {
      return b.size - a.size;
    });

    if (cb('upload')) {
      return;
    }

    let canceled = false;
    let failed = false;
    await Promise.all(
      index.files.map(async (v) => {
        const f = keyMap.get(v.key);
        return this.firebase
          .upload(
            `files/${userID}/${path}/${v.uploadName}`,
            f.encrypted.data,
            (uploaded) => {
              f.uploaded = uploaded;
              if (cb('upload')) {
                canceled = true;
              }
              return canceled;
            }
          )
          .catch((error) => {
            console.error(`uploading ${v.name}`, error);
            failed = true;
            canceled = true;
          });
      })
    );
    if (failed) {
      throw new Error('upload error');
    }
    if (canceled) {
      return;
    }

    {
      cb('indexFile');
      const json = JSON.stringify(index);
      const encrypted = await workerEncrypt(
        key,
        new TextEncoder().encode(json).buffer
      );

      const indexData = concatArray(
        new Uint8Array([1]), // version
        keyPair.publicKey,
        destKeys.subKey,
        encrypted
      );

      await this.firebase.upload(`files/${userID}/${path}/index`, indexData);
    }

    await this.uploadLog.add({
      destID: userID,
      path: path,
      files: files.map((v) => {
        return {
          name: v.file.name,
          size: v.file.size,
        };
      }),
    });

    return path;
  }

  async listUpdateLogs() {
    return this.uploadLog.list();
  }

  async getUploadIndex(id: string, password: string): Promise<UploadIndex> {
    const secret = await this.keyStore.getSecret(password);
    if (!secret) {
      throw new Error('invalid password');
    }

    const indexData = await this.downloadFile(password, id, 'index', true);
    if (!indexData) {
      return;
    }

    const secretKey = convertSecretKey(secret);
    let pos = 1;
    const senderKey = indexData.slice(pos, pos + nacl.box.publicKeyLength);
    pos += nacl.box.publicKeyLength;
    const subKey = indexData.slice(pos, pos + nacl.box.publicKeyLength);
    pos += nacl.box.publicKeyLength;

    const subSecretKey = await this.keyStore.getSubKey(toBase32(subKey));
    if (!subSecretKey) {
      console.error('missing subkey');
      return;
    }

    const dh1 = nacl.box.before(senderKey, secretKey);
    const dh2 = nacl.box.before(senderKey, subSecretKey);
    const key = nacl
      .hash(concatArray(dh1, dh2))
      .slice(0, nacl.box.sharedKeyLength);

    const index = await workerDecrypt(key, indexData.slice(pos));
    if (!index) {
      console.error('decrypt error');
      return;
    }

    return JSON.parse(new TextDecoder().decode(index));
  }

  async downloadFile(
    password: string,
    id: string,
    name: string,
    updateSubKey: boolean,
    cb?: (loaded: number, total: number) => void
  ) {
    const permitted = await this.firebase.checkDownloadPermission(this.userID);
    if (!permitted) {
      const secret = await this.keyStore.getSecret(password);
      const token = await reCaptchaToken();
      const signKeyPair = nacl.sign.keyPair.fromSecretKey(secret);
      const sign = nacl.sign(strToBin(token), secret);

      const params: FunctionParams = {
        recaptchaToken: token,
        params: [
          {
            cmd: 'AllowDownload',
            sign: toBase32(sign),
            signKey: toBase32(signKeyPair.publicKey),
          },
        ],
      };

      const activeSubKeys = await (async () => {
        if (!updateSubKey) {
          return;
        }

        const subKeys = this.genSubKeys();
        params.params.push({
          cmd: 'UpdateSubKeys',
          signKey: toBase32(signKeyPair.publicKey),
          subKeys: subKeys.map((v) => {
            return toBase32(nacl.sign(v.publicKey, signKeyPair.secretKey));
          }),
        });

        const result: string[] = [];
        await this.keyStore.saveSubKeys(
          subKeys.map((v) => {
            const id = toBase32(v.publicKey);
            result.push(id);
            return {
              id: id,
              key: v.secretKey,
            };
          })
        );

        return result;
      })();

      const result = await this.firebase.callFunctions(params);
      if (result.recaptchaError) {
        throw new Error('recaptha error');
      }

      if (activeSubKeys) {
        await this.keyStore.updateSubKeysExpired(
          activeSubKeys,
          new Date().getTime() + appEnv.filesExpiredDays * 24 * 60 * 60 * 1000
        );
      }
    }

    return this.firebase.download(`files/${this.userID}/${id}/${name}`, cb);
  }

  async decryptFile(keyS: string, data: Uint8Array, cb: (val: number) => void) {
    const key = fromBase32(keyS);
    return workerDecrypt(key.buffer, data.buffer, cb);
  }
}

let _app: App;

export const getApp = () => {
  if (!_app) {
    _app = new App();
  }
  return _app;
};
