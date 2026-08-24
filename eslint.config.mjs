import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      // Type-checked rules: these are what catch a floating promise or an
      // unchecked `any` leaking out of a repository, which the syntactic
      // ruleset cannot see.
      ...tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // NestJS leans on decorator metadata and DI, where `any` at the
      // framework boundary is routine; keep these relaxed as the original
      // config had them.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    // The e2e tests drive the app through supertest, whose fluent API and
    // `res.body` are typed `any`. Type-checking that soup adds noise without
    // catching real bugs, so relax the unsafe-`any` family for the e2e dir.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);
