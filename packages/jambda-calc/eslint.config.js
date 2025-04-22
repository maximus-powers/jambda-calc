// @ts-check

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  {
    // Define global ignores so ESLint doesn't spend time on node_modules or other directories
    ignores: ['**/node_modules/**', '**/dist/**', '**/.git/**', 'backup/**']
  },
  js.configs.recommended,
  {
    // Add globals for JavaScript files
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        // Node.js globals
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Node.js globals
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
];