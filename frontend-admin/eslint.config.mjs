import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintConfigPrettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import pluginImport from 'eslint-plugin-import';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  eslintConfigPrettier,
  pluginImport.flatConfigs.recommended,
  pluginPrettierRecommended,
  pluginQuery.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  tseslint.configs.strict, // TODO: Use strict-type-checked
  { ignores: ['**/eslint.config.mjs', '**/postcss.config.cjs'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    plugins: {
      'react-hooks': fixupPluginRules(pluginReactHooks), // TODO: Change when flat config is added. Remove @eslint/compat after.
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules, // TODO: Change when flat config is added. Remove @eslint/compat after.
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
        node: { paths: ['src'] },
        typescript: true,
      },
      'import/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['tsconfig.json', 'tsconfig.node.json'],
        }),
      ],
    },
  },
  {
    settings: {
      react: {
        version: '18.3.1',
      },
    },
  },
);
