//  @ts-check

import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * Lint rules.
 *
 * Two of these are errors rather than warnings, and both are deliberate:
 * `no-explicit-any`, because `any` is how a type error becomes a runtime error
 * six weeks later, and `no-floating-promises`, because a swallowed rejection in
 * a form submit is a button that silently does nothing.
 */
export default tseslint.config(
  {
    ignores: [
      'src/routeTree.gen.ts',
      'dist/**',
      '.output/**',
      '.nitro/**',
      // Nitro's Vercel adapter emits a bundled copy of the whole server here.
      // It is generated, it is gitignored, and every file in it fails to parse
      // because none of them are in the tsconfig project.
      '.vercel/**',
      '.tanstack/**',
      'test-results/**',
      'playwright-report/**',
      'eslint.config.js',
      'prettier.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  /**
   * `configs.flat['recommended-latest']`, not `configs['recommended-latest']`.
   * The plugin still ships the eslintrc-shaped configs at the top level, where
   * `plugins` is an array of strings — flat config rejects those outright, and
   * the error it prints ("plugins key defined as an array of strings") names
   * the shape rather than the import, so it is not obvious what to change.
   */
  reactHooks.configs.flat['recommended-latest'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
