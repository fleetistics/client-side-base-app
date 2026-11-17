#!/usr/bin/env node
/**
 * Single source of truth for the API generation scripts: reads BASE_URL from
 * server-side-base-url.local.ts (gitignored, per-developer) when it exists, otherwise from the
 * committed server-side-base-url.ts (prod). Same files babel.config.js picks between.
 */
const fs = require('fs');
const path = require('path');

const LOCAL_FILE = path.join(__dirname, '..', 'server-side-base-url.local.ts');
const PROD_FILE = path.join(__dirname, '..', 'server-side-base-url.ts');

function getBaseUrl() {
  const sourceFile = fs.existsSync(LOCAL_FILE) ? LOCAL_FILE : PROD_FILE;

  let contents;
  try {
    contents = fs.readFileSync(sourceFile, 'utf8');
  } catch {
    console.error(`Missing ${sourceFile}`);
    process.exit(1);
  }

  const match = contents.match(/BASE_URL\s*=\s*["'](.+?)["']/);
  if (!match) {
    console.error(`Could not find "export const BASE_URL = ..." in ${sourceFile}`);
    process.exit(1);
  }

  return match[1];
}

module.exports = { getBaseUrl };
