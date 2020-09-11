import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import {
  AllowDownloadParams,
  DOWNLOAD_LIMIT,
  fromBase32,
  makeShortID,
  nacl,
} from './common';

export const onAllowDownload = async (
  params: AllowDownloadParams,
  context: CallableContext,
  adminApp: admin.app.App
): Promise<void> => {
  const uid = context.auth?.uid;

  if (!uid) {
    throw new TypeError('missing uid');
  }

  const signKey = fromBase32(params.signKey);
  const sign = fromBase32(params.sign);

  if (nacl.sign.open(sign, signKey) === null) {
    throw new Error('invalid sign');
  }

  const userID = makeShortID(params.signKey);
  const firestore = adminApp.firestore();
  const docRef = firestore.collection('users').doc(userID);

  const doc = await docRef.get();
  const curData = doc.data();
  if (!curData) {
    throw new Error('user is not found');
  }

  if (curData.signKey !== params.signKey) {
    throw new Error('invalid id');
  }

  const expired = new Date().getTime() + DOWNLOAD_LIMIT.expiredSec * 1000;

  const auth = adminApp.auth();

  const user = await auth.getUser(uid);
  const allClaims = user.customClaims || {};
  allClaims.download = { [userID]: expired };

  await auth.setCustomUserClaims(uid, allClaims);
};
