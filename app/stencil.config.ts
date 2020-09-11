import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import replace from '@rollup/plugin-replace';

// https://stenciljs.com/docs/config

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
      __BUILT_TIME__: new Date().getTime().toString(),
    }),
  ],
  devServer: {
    openBrowser: false,
  },
};
