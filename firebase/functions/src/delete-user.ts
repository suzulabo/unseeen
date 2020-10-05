import * as admin from 'firebase-admin';
import { EventContext } from 'firebase-functions';
import { USER_EXPIRED_DAYS } from './common';

export const deleteUser = async (
  _context: EventContext,
  adminApp: admin.app.App
) => {
  const firestore = adminApp.firestore();
  const ref = firestore.collection('users');

  const cutoff = (() => {
    const now = new Date();
    return new Date(now.setDate(now.getDate() - USER_EXPIRED_DAYS));
  })();
  // console.log(cutoff);

  const q = ref.orderBy('updated').endAt(cutoff);
  const r = await q.get();
  r.forEach(async (doc) => {
    console.info(`delete ${doc.id}`);
    await doc.ref.delete();
  });
  return;
};
