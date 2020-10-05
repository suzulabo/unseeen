import { msgs } from './i18n';

describe('i18n', () => {
  it('basic', async () => {
    expect(msgs().start.welcome).toEqual('Unseenへようこそ');
  });
});
