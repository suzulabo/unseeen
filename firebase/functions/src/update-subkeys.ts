import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { fromBase32, makeShortID, nacl, UpdateSubKeysParams } from './common';

export const onUpdateSubKeys = async (
  params: UpdateSubKeysParams,
  _context: CallableContext,
  adminApp: admin.app.App
): Promise<void> => {
  const signKey = fromBase32(params.signKey);
  params.subKeys.forEach((v) => {
    const k = fromBase32(v);
    if (nacl.sign.open(k, signKey) === null) {
      throw new Error('invalid sign');
    }
  });

  const userID = makeShortID(params.signKey);
  const firestore = adminApp.firestore();
  const docRef = firestore.collection('users').doc(userID);
  const data = {
    signKey: params.signKey,
    subKeys: params.subKeys,
    updated: admin.firestore.FieldValue.serverTimestamp(),
  };

  const doc = await docRef.get();
  const curData = doc.data();
  if (!curData) {
    await docRef.create(data);
    return;
  }

  if (curData.signKey !== data.signKey) {
    throw new Error('duplicate id');
  }

  await docRef.update(data);
};
