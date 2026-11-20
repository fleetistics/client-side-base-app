const fs = require('fs');
const path = require('path');

// `pnpm android:local` sets APP_ENV=local -> use the gitignored server-side-base-url.local.ts
// (if present). Everything else (pnpm android, release builds) uses the committed prod file.
const LOCAL_FILE = './server-side-base-url.local.ts';
const PROD_FILE = './server-side-base-url.ts';

// `pnpm release-app` writes the gitignored app-hash.local.ts; otherwise the empty default is used.
const HASH_LOCAL_FILE = './app-hash.local.ts';
const HASH_DEFAULT_FILE = './app-hash.default.ts';

module.exports = api => {
  // Part of Metro's transform cache key, so switching modes never serves a stale URL.
  api.cache.using(() => process.env.APP_ENV);

  const hasHashFile = fs.existsSync(path.join(__dirname, HASH_LOCAL_FILE));
  api.cache.using(() => hasHashFile);

  const useLocal =
    process.env.APP_ENV === 'local' && fs.existsSync(path.join(__dirname, LOCAL_FILE));

  return {
    presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@test-utils': './src/test/test-utils.tsx',
            '@app-hash': hasHashFile ? HASH_LOCAL_FILE : HASH_DEFAULT_FILE,
            '@server-side-base-url': useLocal ? LOCAL_FILE : PROD_FILE,
          },
        },
      ],
    ],
  };
};
