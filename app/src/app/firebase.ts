import { FunctionParams, FunctionResult } from '@common';
import { Build } from '@stencil/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
import { appEnv } from './appenv';

export class Firebase {
  constructor(private firebaseApp?: firebase.app.App) {}

  private devonly_setEmulator() {
    if (!Build.isDev) {
      return;
    }
    console.log('useFunctionsEmulator');
    const functions = this.firebaseApp.functions();
    functions.useFunctionsEmulator(`http://${location.host}`);
    const firestore = this.firebaseApp.firestore();
    firestore.settings({ ssl: false, host: `${location.host}` });
  }

  private async singIn() {
    const auth = this.firebaseApp.auth();
    await auth.signInAnonymously();
  }

  async init() {
    if (this.firebaseApp) {
      return;
    }

    this.firebaseApp = firebase.initializeApp(appEnv.firebaseConfig);

    const auth = this.firebaseApp.auth();

    await auth.signOut(); // reset custom claims

    this.devonly_setEmulator();
  }

  async callFunctions(params: FunctionParams): Promise<FunctionResult> {
    const refreshToken = params.params.find((v) => {
      return v.cmd == 'AllowUpload' || v.cmd == 'AllowDownload';
    });

    if (refreshToken) {
      await this.singIn();
    }

    const functions = this.firebaseApp.functions();
    const f = functions.httpsCallable('f');
    const result = await f(params);
    if (refreshToken) {
      const auth = this.firebaseApp.auth();
      await auth.currentUser.getIdToken(true);
    }
    return result.data as FunctionResult;
  }

  async checkDownloadPermission(userID: string) {
    const auth = this.firebaseApp.auth();

    if (!auth.currentUser) {
      return false;
    }

    const token = await auth.currentUser.getIdTokenResult();
    if (!token.claims?.download) {
      return false;
    }
    const allowTime = token.claims.download[userID] as number;
    if (!allowTime) {
      return false;
    }
    const now = new Date().getTime();
    if (allowTime < now + 60 * 1000) {
      return false;
    }

    return true;
  }

  async getUser(userID: string) {
    await this.singIn();

    const firestore = this.firebaseApp.firestore();
    const docRef = firestore.collection('users').doc(userID);
    const doc = await docRef.get();
    const data = doc.data();
    if (!data) {
      return;
    }
    return data as { signKey: string; subKeys: string[] };
  }

  async upload(
    path: string,
    data: Uint8Array,
    cb?: (uploaded: number) => boolean
  ) {
    const storage = this.firebaseApp.storage();
    const task = storage.ref(path).put(data);
    task.on(firebase.storage.TaskEvent.STATE_CHANGED, (ss) => {
      if (cb && cb(ss.bytesTransferred)) {
        task.cancel();
      }
    });

    try {
      const ss = await task;
      return ss.state;
    } catch (error) {
      if (task.snapshot.state == firebase.storage.TaskState.CANCELED) {
        return task.snapshot.state;
      }
      throw error;
    }
  }

  async download(path: string, cb?: (loaded: number, total: number) => void) {
    const storage = this.firebaseApp.storage();
    const ref = storage.ref(path);

    try {
      const url = await ref.getDownloadURL();
      const res = await fetch(url);
      const contentLength = +res.headers.get('Content-Length');
      const reader = res.body.getReader();

      const result = new Uint8Array(contentLength);
      let downloaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        result.set(value, downloaded);
        downloaded += value.byteLength;
        cb && cb(downloaded, contentLength);
      }
      return result;
    } catch (error) {
      switch (error.code) {
        case 'storage/object-not-found':
        case 'storage/canceled':
          return null;
      }
      throw error;
    }
  }
}
