module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb-base',
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'class-methods-use-this': 'off'
  },
  env: {
    node: true,
    browser: true,
  },
};
  