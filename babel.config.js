const fs = require('fs');
const path = require('path');

// `pnpm android:local` sets APP_ENV=local -> use the gitignored server-side-base-url.local.ts
// (if present). Everything else (pnpm android, release builds) uses the committed prod file.
const LOCAL_FILE = './server-side-base-url.local.ts';
const PROD_FILE = './server-side-base-url.ts';

module.exports = api => {
  // Part of Metro's transform cache key, so switching modes never serves a stale URL.
  api.cache.using(() => process.env.APP_ENV);

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
            '@server-side-base-url': useLocal ? LOCAL_FILE : PROD_FILE,
          },
        },
      ],
    ],
  };
};
