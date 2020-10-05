import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { AllowUploadParams, UPLOAD_LIMIT } from './common';

export const onAllowUpload = async (
  params: AllowUploadParams,
  context: CallableContext,
  adminApp: admin.app.App
): Promise<void> => {
  const uid = context.auth?.uid;

  if (!uid) {
    throw new TypeError('missing uid');
  }

  if (!params.destID.match(/^[0-9A-Z]{12}$/)) {
    throw new TypeError('invalid destID');
  }
  if (!params.path.match(/^[0-9A-Z]{12}$/)) {
    throw new TypeError('invalid path');
  }

  const firestore = adminApp.firestore();
  const docRef = firestore.collection('users').doc(params.destID);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new TypeError('destID is not found');
  }

  if (params.files.length > UPLOAD_LIMIT.count) {
    throw new RangeError('files length');
  }

  const total = params.files.reduce((n, v) => {
    if (v.size > UPLOAD_LIMIT.fileSize) {
      throw new RangeError('file size');
    }
    if (!v.name.match(/^[0-9A-Z]{12}$/)) {
      throw new TypeError('invalid name');
    }
    return n + v.size;
  }, 0);
  if (total > UPLOAD_LIMIT.totalSize) {
    throw new RangeError('total size');
  }

  const expired = new Date().getTime() + UPLOAD_LIMIT.expiredSec * 1000;
  const claims: { [key: string]: number[] } = {};
  const filePrefix = `files/${params.destID}/${params.path}`;
  params.files.forEach((v) => {
    claims[`${filePrefix}/${v.name}`] = [v.size, expired];
  });
  claims[`${filePrefix}/index`] = [10000, expired];

  const auth = adminApp.auth();

  const user = await auth.getUser(uid);
  const allClaims = user.customClaims || {};
  if (allClaims.upload) {
    const curClaims = allClaims.upload as { [key: string]: number[] };
    const now = new Date().getTime();
    for (const [k, v] of Object.entries(curClaims)) {
      if (v[1] >= now) {
        claims[k] = v;
      }
    }
  }

  allClaims.upload = claims;

  await auth.setCustomUserClaims(uid, allClaims);
};
