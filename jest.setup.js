// Native-module mocks for component tests. Jest has no native binary, so any package that
// resolves a TurboModule at import time (TurboModuleRegistry.getEnforcing) has to be replaced.
// Packages that ship their own mock use it; the rest get a minimal stub of the surface the
// app actually calls. These only need to let modules load and effects run without throwing.

// Returns an object whose every property is a jest.fn resolving to `value` - for wide
// promise-based native APIs where the exact method list doesn't matter to tests. Properties
// on `base` are kept as-is. (Build on `base` rather than spreading the result: spreading a
// Proxy copies nothing, since its properties are only created on first access.)
const promiseApi = (value = undefined, base = {}) =>
  new Proxy(base, {
    get: (target, prop) => {
      if (!(prop in target)) target[prop] = jest.fn(() => Promise.resolve(value));
      return target[prop];
    },
  });

// No real network from tests: the app's startup queries (session check, translations,
// team context) would otherwise hit APP_CONFIG.BASE_URL. Each test can override this.
global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed (fetch is disabled in tests)')));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

jest.mock('react-native-image-crop-picker', () => ({
  __esModule: true,
  default: { openPicker: jest.fn(() => Promise.resolve([])), openCamera: jest.fn(() => Promise.resolve([])) },
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    // A filesystem that accepts every write and holds nothing, so the logger's file
    // transport runs its normal path in component tests.
    fs: promiseApi(undefined, {
      dirs: { DocumentDir: '/mock/documents', CacheDir: '/mock/cache' },
      exists: jest.fn(() => Promise.resolve(false)),
      ls: jest.fn(() => Promise.resolve([])),
      stat: jest.fn((path) => Promise.resolve({ path, size: 0, type: 'file', lastModified: 0 })),
      readFile: jest.fn(() => Promise.resolve('')),
    }),
    fetch: jest.fn(() => Promise.resolve({ info: () => ({ status: 200 }), text: () => '', json: () => ({}) })),
    wrap: jest.fn((path) => `RNFetchBlob-file://${path}`),
  },
}));

jest.mock('react-native-background-geolocation', () => {
  const subscription = () => ({ remove: jest.fn() });
  return {
    __esModule: true,
    default: promiseApi({}, {
      ready: jest.fn(() => Promise.resolve({ enabled: false })),
      getProviderState: jest.fn(() => Promise.resolve({ enabled: true, status: 3 })),
      onLocation: jest.fn(subscription),
      onHttp: jest.fn(subscription),
      onHeartbeat: jest.fn(subscription),
      onProviderChange: jest.fn(subscription),
      logger: promiseApi(),
      LogLevel: {},
      DesiredAccuracy: {},
      ActivityType: {},
    }),
  };
});

jest.mock('@react-native-firebase/app', () => ({ getApp: jest.fn(() => ({})) }));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  recordError: jest.fn(),
  didCrashOnPreviousExecution: jest.fn(() => Promise.resolve(false)),
  setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
  setAttribute: jest.fn(() => Promise.resolve()),
  setUserId: jest.fn(() => Promise.resolve()),
  log: jest.fn(),
  crash: jest.fn(),
}));

jest.mock('react-native-splash-view', () => ({ hideSplash: jest.fn(), showSplash: jest.fn() }));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const component = (name) => {
    const C = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref, testID: props.testID ?? name }));
    C.displayName = name;
    return C;
  };
  const MapView = component('MapView');
  return {
    __esModule: true,
    default: MapView,
    Marker: component('Marker'),
    MapMarker: component('MapMarker'),
    Callout: component('Callout'),
    Polyline: component('Polyline'),
    Circle: component('Circle'),
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-camera-kit', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Camera: (props) => React.createElement(View, props),
    CameraType: { Front: 'front', Back: 'back' },
  };
});
