import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        URLSearchParams: 'readonly',
        history: 'readonly',
        DatabaseClient: 'readonly',
        HanziTree: 'readonly',
        alert: 'readonly'
      }
    },
    rules: {
      'indent': 'off', // Mixed indentation in existing code
      'quotes': ['warn', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': ['off'], // Allow console in this project
      'prefer-const': ['warn'],
      'no-var': ['error'],
      'no-undef': ['error']
    }
  },
  {
    files: ['server.js'],
    languageOptions: {
      sourceType: 'script'
    }
  }
];