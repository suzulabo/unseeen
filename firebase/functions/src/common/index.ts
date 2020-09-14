import base32Decode from 'base32-decode';
import base32Encode from 'base32-encode';
import { default as tweetnacl } from 'tweetnacl';

export const nacl = tweetnacl;

export function toBase32(v: Uint8Array) {
  return base32Encode(v, 'Crockford');
}

export const fromBase32 = (s: string) => {
  return new Uint8Array(base32Decode(s, 'Crockford'));
};

export const makeShortID = (v: string, length = 12) => {
  const hash = toBase32(nacl.hash(fromBase32(v)));
  return v.substring(0, length / 2) + hash.substring(0, length / 2);
};

export const UPLOAD_LIMIT = {
  fileSize: 100 * 1024 * 1024,
  totalSize: 200 * 1024 * 1024,
  count: 10,
  expiredSec: 10 * 60,
} as const;

export const DOWNLOAD_LIMIT = {
  expiredSec: 60 * 60,
} as const;

export const USER_EXPIRED_DAYS = 90;

export interface FunctionParams {
  recaptchaToken: string;

  params: (
    | UpdateSubKeysParams
    | DeleteIDParams
    | AllowUploadParams
    | AllowDownloadParams
  )[];
}

export interface FunctionResult {
  recaptchaError?: boolean;
}

export interface UpdateSubKeysParams {
  cmd: 'UpdateSubKeys';
  signKey: string;
  subKeys: string[];
}

export interface DeleteIDParams {
  cmd: 'DeleteID';
  signKey: string;
  sign: string;
}

export interface AllowUploadParams {
  cmd: 'AllowUpload';
  destID: string;
  path: string;
  files: { name: string; size: number }[];
}

export interface AllowDownloadParams {
  cmd: 'AllowDownload';
  signKey: string;
  sign: string;
}
