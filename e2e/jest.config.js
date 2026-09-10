/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    rootDir: '..',
    testMatch: ['<rootDir>/e2e/**/*.test.ts'],
    testTimeout: 120000,
    maxWorkers: 1,
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    reporters: ['detox/runners/jest/reporter'],
    testEnvironment: 'detox/runners/jest/testEnvironment',
    // pixelmatch ships ESM-only (no CJS build) — let it through the default node_modules
    // transform-ignore so babel can convert its `export default` for Jest's CJS runtime.
    transformIgnorePatterns: ['node_modules/(?!(pixelmatch)/)'],
    transform: {
        '^.+\\.(js|tsx?)$': ['babel-jest', {
            configFile: false, babelrc: false,
            presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
        }],
    },
    verbose: true,
};
