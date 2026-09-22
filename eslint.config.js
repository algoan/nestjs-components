'use strict';

const algoan = require('@algoan/eslint-config');

module.exports = [
  {
    ignores: ['**/*.test.ts', '**/helpers.ts'],
  },
  ...algoan,
  {
    rules: {
      'no-magic-numbers': ['error', { ignoreArrayIndexes: false, ignore: [0, 1, -1] }],
      camelcase: 'off',
      '@typescript-eslint/naming-convention': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      // Previously covered by the (now removed) "@typescript-eslint/tslint/config"
      // rule, which this project had turned off.
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
];
