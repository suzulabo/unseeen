import { msgs as jaMsgs } from './msg.ja';

const lang = 'ja';

const msgsMap = {
  ja: jaMsgs,
};

export const msgs = () => {
  return msgsMap[lang];
};
