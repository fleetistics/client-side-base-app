// Fallback used when app-hash.local.ts (gitignored) does not exist, e.g. regular dev runs.
// `pnpm release-app` generates app-hash.local.ts with the short git commit hash.
export const APP_HASH = "";
