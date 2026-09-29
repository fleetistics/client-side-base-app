module.exports = {
  preset: '@react-native/jest-preset',
  // Native-module mocks (Jest has no native binary for TurboModules to resolve against).
  setupFiles: ['<rootDir>/jest.setup.js'],
  // e2e/ has its own jest.config.js (Detox's node-side test runner, not RN component tests).
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  moduleNameMapper: {
    '^react-native-device-info$': '<rootDir>/node_modules/react-native-device-info/jest/react-native-device-info-mock.js',
  },
  // The preset only lets react-native's own packages through the ESM->CJS transform;
  // these ship ESM too and need the same treatment. They get a bare RN babel preset
  // (see `transform` below) rather than the project's own babel.config.js, since that
  // config's nativewind preset injects a css-interop runtime check meant for app code,
  // which breaks when applied to unrelated vendor files.
  // `react-native-*` covers the third-party native packages (maps, permissions, ...),
  // which ship untranspiled ESM/TS.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[^/]+)?|@react-native(-[^/]+)?|react-redux|@reduxjs/toolkit|@react-navigation|@testing-library|immer|use-sync-external-store|redux(-thunk)?|reselect|react-native-css-interop|@rn-primitives|lucide-react-native|uuid)/)',
  ],
  transform: {
    '^.+[/\\\\]node_modules[/\\\\](react-redux|@reduxjs|@react-navigation|@testing-library|immer|use-sync-external-store|redux(-thunk)?|reselect|react-native-css-interop|@rn-primitives|lucide-react-native|uuid)[/\\\\].+\\.m?[jt]sx?$':
      ['babel-jest', { configFile: false, babelrc: false, presets: ['module:@react-native/babel-preset'] }],
    // Same reason for jest.setup.js: the css-interop import nativewind injects is an
    // out-of-scope variable inside jest.mock() factories, which babel-jest rejects.
    '[/\\\\]jest\\.setup\\.js$':
      ['babel-jest', { configFile: false, babelrc: false, presets: ['module:@react-native/babel-preset'] }],
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
};
