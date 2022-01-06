module.exports = {
  parser: '@babel/eslint-parser',
  extends: 'airbnb-base',
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'class-methods-use-this': 'off',
    'function-paren-newline': 'off',
  },
  env: {
    node: true,
    browser: true,
  },
};
