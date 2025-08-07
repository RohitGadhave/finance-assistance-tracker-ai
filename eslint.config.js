import js from '@eslint/js';

import tseslint from 'typescript-eslint';
const rules = [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    //   'quotes': ['error', 'single', { avoidEscape: true }],

        'semi': ['error', 'always'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    }
  }
];
export default rules;
