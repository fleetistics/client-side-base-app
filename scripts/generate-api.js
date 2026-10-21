#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { getBaseUrl } = require('./get-base-url');

const baseUrl = getBaseUrl();

const result = spawnSync(
  'pnpm',
  [
    'dlx',
    '--package=typescript@^5.9.2',
    '--package=openapi-typescript@^7',
    'openapi-typescript', `${baseUrl}/openapi/v1.json`,
    '-o', 'src/client-side.Commons/dataLayer/apiSchema.d.ts',
  ],
  { stdio: 'inherit', shell: true }
);

process.exit(result.status ?? 1);
