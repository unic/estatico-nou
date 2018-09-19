module.exports = {
  extends: require.resolve('@unic/estatico-eslint/.eslintrc.js'),
  plugins: [
    'jest',
  ],
  env: {
    'jest/globals': true,
  },
  globals: {
    Modernizr: true,
  },
};
