#!/usr/bin/env node
/**
 * Some Windows machines set NoDefaultCurrentDirectoryInExePath=1 (a security hardening
 * flag against executable-planting attacks). That stops cmd.exe from implicitly
 * searching the current directory for a bare command name. The React Native CLI always
 * invokes the Gradle wrapper as a bare "gradlew.bat" with cwd=android/ (not "./gradlew.bat"
 * or an absolute path), so on those machines `pnpm android` fails with:
 *   'gradlew.bat' is not recognized as an internal or external command
 *
 * cmd.exe still searches PATH even with that flag set, so putting android/ on PATH here
 * lets it resolve. Harmless on machines without the flag or on macOS/Linux.
 */
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

// --local: build against the gitignored server-side-base-url.local.ts (see babel.config.js).
const args = process.argv.slice(2);
const local = args.includes('--local');
const rnArgs = args.filter(a => a !== '--local');

// Metro bakes APP_ENV in when it starts (babel alias for @server-side-base-url). `run-android`
// only starts Metro if nothing is listening on the port, otherwise it reuses the running one --
// which was started with a different APP_ENV and keeps serving the other URL.
function isMetroRunning(port) {
  return new Promise(resolve => {
    const req = http.get({ host: 'localhost', port, path: '/status', timeout: 1500 }, res => {
      res.resume();
      resolve(true);
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(false));
  });
}

const androidDir = path.join(__dirname, '..', 'android');
const env = {
  ...process.env,
  PATH: `${androidDir}${path.delimiter}${process.env.PATH ?? ''}`,
  APP_ENV: local ? 'local' : '',
};

(async () => {
  if (local && (await isMetroRunning(8081))) {
    console.error(
      'A Metro bundler is already running on port 8081; it was started without APP_ENV=local ' +
        'and would keep serving the prod server-side-base-url. Stop it (close its terminal / ' +
        'Ctrl+C) and run `pnpm android:local` again so Metro is started in local mode.',
    );
    process.exit(1);
  }

  const result = spawnSync('npx', ['react-native', 'run-android', ...rnArgs], {
    stdio: 'inherit',
    env,
    shell: true,
  });

  process.exit(result.status ?? 1);
})();
