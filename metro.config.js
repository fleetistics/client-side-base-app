const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const fs = require('fs');
const path = require('path');

const RN_ROOT = path.dirname(require.resolve('react-native/package.json')) + path.sep;
const RN_PRIVATE = path.join(RN_ROOT, 'src', 'private') + path.sep;

const config = {
  // Metro's transform cache ignores babel.config.js, so without this a bundle transformed in one
  // APP_ENV mode (see babel.config.js: @server-side-base-url alias) is served stale in the other.
  cacheVersion: process.env.APP_ENV || 'default',
  resolver: {
    // React Native's Libraries/ (and @react-native/virtualized-lists) import from
    // react-native/src/private/*, which is not listed in react-native's package.json
    // "exports", so Metro logs a warning for each import. Resolve those directly to the
    // file (what Metro's "file-based resolution" fallback does anyway) to silence it.
    resolveRequest: (context, moduleName, platform) => {
      let target = null;
      if (moduleName.startsWith('react-native/src/private/')) {
        target = path.join(RN_ROOT, moduleName.slice('react-native/'.length));
      } else if (moduleName.startsWith('.') && context.originModulePath.startsWith(RN_ROOT)) {
        target = path.resolve(path.dirname(context.originModulePath), moduleName);
      }
      if (target && target.startsWith(RN_PRIVATE)) {
        for (const ext of ['.js', '/index.js']) {
          if (fs.existsSync(target + ext)) {
            return { type: 'sourceFile', filePath: target + ext };
          }
        }
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(__dirname), config), {
  input: './global.css',
});
