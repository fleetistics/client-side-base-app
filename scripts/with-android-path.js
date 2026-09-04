#!/usr/bin/env node
/**
 * Some Windows machines set NoDefaultCurrentDirectoryInExePath=1 (a security hardening
 * flag against executable-planting attacks). That stops cmd.exe from implicitly
 * searching the current directory for a bare command name. The React Native CLI always
 * invokes the Gradle wrapper as a bare "gradlew.bat" with cwd=android/ (not "./gradlew.bat"
 * or an absolute path), so on those machines `yarn android` fails with:
 *   'gradlew.bat' is not recognized as an internal or external command
 *
 * cmd.exe still searches PATH even with that flag set, so putting android/ on PATH here
 * lets it resolve. Harmless on machines without the flag or on macOS/Linux.
 */
const path = require('path');
const { spawnSync } = require('child_process');

const androidDir = path.join(__dirname, '..', 'android');
const env = {
  ...process.env,
  PATH: `${androidDir}${path.delimiter}${process.env.PATH ?? ''}`,
};

const result = spawnSync('npx', ['react-native', 'run-android', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  shell: true,
});

process.exit(result.status ?? 1);
