module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': 'off',
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '.*', args: 'after-used', argsIgnorePattern: '^_' },
    ],
  },
}
