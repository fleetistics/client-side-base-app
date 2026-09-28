#!/usr/bin/env node
/**
 * Single source of truth for the API generation scripts: reads BASE_URL out of
 * server-side-base-url.ts (gitignored, per-developer) instead of hardcoding an
 * IP in package.json.
 */
const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '..', 'server-side-base-url.ts');

function getBaseUrl() {
  let contents;
  try {
    contents = fs.readFileSync(SOURCE_FILE, 'utf8');
  } catch {
    console.error(
      `Missing ${SOURCE_FILE}.\nCreate it with:\n  export const BASE_URL = "http://<your-dev-server>:7225";`
    );
    process.exit(1);
  }

  const match = contents.match(/BASE_URL\s*=\s*["'](.+?)["']/);
  if (!match) {
    console.error(`Could not find "export const BASE_URL = ..." in ${SOURCE_FILE}`);
    process.exit(1);
  }

  return match[1];
}

module.exports = { getBaseUrl };
