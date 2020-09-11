import fetch from 'node-fetch';
import * as functions from 'firebase-functions';

const API_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SECRET_CODE = functions.config().recaptcha.secret_code;
const VALID_SCORE = 0.5;

export const verify = async (token: string) => {
  const params = new URLSearchParams();
  params.append('secret', SECRET_CODE);
  params.append('response', token);
  const res = await fetch(API_URL, {
    method: 'POST',
    body: params,
  });

  const result = (await res.json()) as {
    success: boolean;
    score: number;
    action: string;
    challenge_ts: string;
    hostname: string;
    'error-codes': [];
  };

  if (result.success && result.score >= VALID_SCORE) {
    return true;
  }

  console.log(result);
  return false;
};
