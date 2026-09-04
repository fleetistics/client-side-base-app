module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^react-native-device-info$': '<rootDir>/node_modules/react-native-device-info/jest/react-native-device-info-mock.js',
  },
  // The preset only lets react-native's own packages through the ESM->CJS transform;
  // these ship ESM too and need the same treatment. They get a bare RN babel preset
  // (see `transform` below) rather than the project's own babel.config.js, since that
  // config's nativewind preset injects a css-interop runtime check meant for app code,
  // which breaks when applied to unrelated vendor files.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-redux|@reduxjs/toolkit|@react-navigation|@testing-library|immer|use-sync-external-store|redux(-thunk)?|reselect|react-native-css-interop)/)',
  ],
  transform: {
    '^.+[/\\\\]node_modules[/\\\\](react-redux|@reduxjs|@react-navigation|@testing-library|immer|use-sync-external-store|redux(-thunk)?|reselect|react-native-css-interop)[/\\\\].+\\.[jt]sx?$':
      ['babel-jest', { configFile: false, babelrc: false, presets: ['module:@react-native/babel-preset'] }],
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
};
