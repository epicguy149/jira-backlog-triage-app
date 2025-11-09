module.exports = {
  root: true,
  env: { browser: true, es2022: true },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },

  plugins: [
    '@typescript-eslint',
    '@atlaskit/design-system',
    '@atlaskit/ui-styling-standard',
    'react',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@atlaskit/design-system/recommended',
    'plugin:@atlaskit/ui-styling-standard/recommended',
  ],

  settings: { react: { version: 'detect' } },

  rules: {
    '@atlaskit/ui-styling-standard/use-compiled': 'error',
    '@atlaskit/design-system/ensure-design-token-usage': 'warn',
    '@atlaskit/ui-styling-standard/convert-props-syntax': 'warn',
    '@atlaskit/design-system/local-cx-xcss': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },

  overrides: [
    {
      files: ['backend/**/*.ts', 'contracts/**/*.ts'],
      env: { browser: false, node: true },
      rules: {
        '@atlaskit/design-system/ensure-design-token-usage': 'off',
        '@atlaskit/ui-styling-standard/use-compiled': 'off',
        '@atlaskit/ui-styling-standard/convert-props-syntax': 'off',
        '@atlaskit/design-system/local-cx-xcss': 'off',
      },
    },
  ],

  ignorePatterns: [
    'frontend/build/**'
  ],
};