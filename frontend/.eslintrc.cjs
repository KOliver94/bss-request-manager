module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: '2021',
    sourceType: 'module',
  },
  plugins: ['jsx-a11y', 'prettier', 'react', 'react-hooks'],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-unresolved': [
      'error',
      {
        ignore: ['router/dom'],
      },
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'react/forbid-prop-types': 'off',
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/jsx-props-no-spreading': 'off',
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['.', 'node_modules'],
      },
    },
    react: {
      version: '18.3.1',
    },
  },
};
