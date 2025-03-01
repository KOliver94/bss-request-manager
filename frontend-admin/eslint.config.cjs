const eslint = require('@eslint/js');
const pluginQuery = require('@tanstack/eslint-plugin-query');
const eslintConfigPrettier = require('eslint-config-prettier');
const pluginImport = require('eslint-plugin-import');
const pluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const pluginReact = require('eslint-plugin-react');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const path = require('path');

const currentDir = path.resolve(__dirname);

module.exports = tseslint.config(
  eslint.configs.recommended,
  eslintConfigPrettier,
  pluginImport.flatConfigs.recommended,
  pluginPrettierRecommended,
  pluginQuery.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  pluginReactHooks.configs['recommended-latest'], // TODO: Change this to recommended with version 6.0
  tseslint.configs.strict, // TODO: Use strict-type-checked
  { ignores: ['**/eslint.config.cjs', '**/postcss.config.cjs'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: currentDir,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
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
      'sort-keys': ['error', 'asc', { caseSensitive: true, natural: true }],
    },
    settings: {
      'import/resolver': {
        node: {
          paths: [path.resolve(currentDir, 'src')],
        },
        typescript: {
          alwaysTryTypes: true,
          project: [
            path.resolve(currentDir, 'tsconfig.json'),
            path.resolve(currentDir, 'tsconfig.node.json'),
          ],
        },
      },
    },
  },
  {
    settings: {
      react: {
        version: '19.0.0',
      },
    },
  },
);
