import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { DeleteIDParams, fromBase32, makeShortID, nacl } from './common';

export const onDeleteID = async (
  params: DeleteIDParams,
  _context: CallableContext,
  adminApp: admin.app.App
): Promise<void> => {
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
    return;
  }

  if (curData.signKey !== params.signKey) {
    throw new Error('invalid id');
  }

  await docRef.delete();
};
