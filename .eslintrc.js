module.exports = {
  extends: 'airbnb-base',
  ignorePatterns: [
    '**/dist',
    '**/test',
    '**/estatico-eslint/test/fixtures/main.js',
    '**/estatico-webpack/test/fixtures/async.js',
    '**/estatico-boilerplate/src',
  ],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
  },
};
