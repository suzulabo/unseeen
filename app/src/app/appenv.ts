export interface AppEnvironment {
  firebaseConfig: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly databaseURL: string;
    readonly projectId: string;
    readonly storageBucket: string;
    readonly messagingSenderId: string;
    readonly appId: string;
  };
  readonly reCAPTCHASiteKey: string;
  readonly subKeysCount: number;
  readonly filesExpiredDays: number;
}

export let appEnv: AppEnvironment;

export const setAppEnv = (env: AppEnvironment) => {
  appEnv = env;
};

export const builtTime = parseInt('__BUILT_TIME__');
