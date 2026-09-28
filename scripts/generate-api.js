#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { getBaseUrl } = require('./get-base-url');

const baseUrl = getBaseUrl();

const result = spawnSync(
  'yarn',
  [
    'dlx', '-q',
    '-p', 'typescript@^5.9.2',
    '-p', 'openapi-typescript@^7',
    'openapi-typescript', `${baseUrl}/openapi/v1.json`,
    '-o', 'src/app.Commons/dataLayer/apiSchema.d.ts',
  ],
  { stdio: 'inherit', shell: true }
);

process.exit(result.status ?? 1);
