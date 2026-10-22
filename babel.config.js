module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
          '@test-utils': './src/test/test-utils.tsx',
          '@server-side-base-url': './server-side-base-url.ts',
        },
      },
    ],
  ],
};
