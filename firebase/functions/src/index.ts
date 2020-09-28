import { initializeApp } from 'firebase-admin';
import { config, pubsub } from 'firebase-functions';
import { onCall } from 'firebase-functions/lib/providers/https';
import { onAllowDownload } from './allow-download';
import { onAllowUpload } from './allow-upload';
import { FunctionParams, FunctionResult } from './common';
import { deleteUser } from './delete-user';
import { onDeleteID } from './deleteid';
import { verify } from './recaptcha';
import { onUpdateSubKeys } from './update-subkeys';

const adminApp = initializeApp();

export const f = onCall(
  async (data, context): Promise<FunctionResult> => {
    const params = data as FunctionParams;
    if (!(await verify(params.recaptchaToken))) {
      return { recaptchaError: true };
    }

    await Promise.all(
      params.params.map((param) => {
        switch (param.cmd) {
          case 'UpdateSubKeys':
            return onUpdateSubKeys(param, context, adminApp);
          case 'DeleteID':
            return onDeleteID(param, context, adminApp);
          case 'AllowUpload':
            return onAllowUpload(param, context, adminApp);
          case 'AllowDownload':
            return onAllowDownload(param, context, adminApp);
          default:
            throw new TypeError('invalid params');
        }
      })
    );

    return {};
  }
);

export const scheduledDaily = pubsub
  .schedule(config().schedule.daily)
  .timeZone(config().schedule.tz)
  .onRun((context) => {
    return deleteUser(context, adminApp);
  });
