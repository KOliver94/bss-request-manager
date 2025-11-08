const globals = require('globals');
const eslintPlugin = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const prettierPluginRecommended = require('eslint-plugin-prettier/recommended');
const prettierConfig = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');
const path = require('path');

const currentDir = path.resolve(__dirname);

module.exports = tseslint.config(
  eslintPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.recommended,
  prettierPluginRecommended,
  prettierConfig,
  tseslint.configs.recommended,
  { ignores: ['**/eslint.config.cjs'] },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
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
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['router/dom'],
        },
      ],
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
      'jsx-a11y/no-autofocus': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/forbid-prop-types': 'off',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/jsx-props-no-spreading': 'off',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react-hooks/set-state-in-effect': 'off', // TODO: Check later
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.mjs'],
          paths: [path.resolve(currentDir, 'src')],
          moduleDirectory: ['node_modules', 'src'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: [
            path.resolve(currentDir, 'tsconfig.json'),
            path.resolve(currentDir, 'tsconfig.node.json'),
          ],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.js', '.jsx', '.mjs'],
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
