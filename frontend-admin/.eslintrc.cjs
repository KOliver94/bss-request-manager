module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:@typescript-eslint/strict', // TODO: Use strict-type-checked
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: ['tsconfig.json', './tsconfig.node.json'],
    sourceType: 'module',
  },
  plugins: ['@tanstack/query', '@typescript-eslint', 'prettier', 'react'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'react/react-in-jsx-scope': 'off',
    'sort-keys': ['error', 'asc', { caseSensitive: true, natural: true }],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
      typescript: true,
    },
    react: {
      version: '18.2.0',
    },
  },
};
