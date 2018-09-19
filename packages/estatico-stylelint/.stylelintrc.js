module.exports = {
  extends: [
    // We are using airbnb's styleguide
    // Config copied from https://github.com/airbnb/css/pull/56
    './stylelint-config-airbnb.js',
  ],
  rules: {
    // Added exception for 'after-same-name' and ignore for 'else'
    'at-rule-empty-line-before': [
      'always',
      { ignore: ['after-comment'], except: ['first-nested', 'after-same-name'], ignoreAtRules: ['else'] },
    ],
    // Adaption to some sass specifics
    'order/order': [
      { type: 'at-rule', name: 'include', hasBlock: false },
      'declarations',
      'rules',
      { type: 'at-rule', name: 'if' },
      { type: 'at-rule', name: 'else' },
      { type: 'at-rule', hasBlock: true },
      { type: 'at-rule', name: 'return' },
    ],
  },
};
