import replace from '@rollup/plugin-replace';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config

declare var process: {
  env: {
    [key: string]: string;
  };
};

const buildSrc = () => {
  const commitId = process.env['COMMIT_ID'];
  const branchName = process.env['BRANCH_NAME'];
  if (commitId && branchName) {
    return `${branchName}/${commitId}`;
  }
  return process.env['_SRCVAR'];
};

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: { globPatterns: ['**/*.{js,css,json,html,ico,png}'] },
    },
  ],
  plugins: [
    sass({}),
    replace({
      __BUILD_SRC__: buildSrc(),
      __BUILT_TIME__: new Date().getTime().toString(),
    }),
  ],
  devServer: {
    openBrowser: false,
  },
};
