module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.+\\.spec2.ts$',
  globals: {
    'ts-jest': {
      tsConfig: {
        esModuleInterop: true,
      },
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest-spec2.setup.ts'],
};
