import { builtinModules } from 'node:module'
import { defineConfig } from 'oxlint'

import { stateHooks } from './tooling/react-state.ts'

export default defineConfig({
  plugins: ['import', 'typescript', 'react', 'jsx-a11y', 'unicorn', 'oxc'],
  jsPlugins: ['./tooling/reatom.ts'],
  options: { typeAware: true },
  ignorePatterns: ['out/**'],
  categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
  rules: {
    'react/react-in-jsx-scope': 'off', // JSX is compiled with the automatic runtime.
    'project/async-extensions': 'error',
    'project/resource-lifecycle': 'error',
    'project/peek-usage': 'error',
    'project/wrapped-await': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-duplicates': 'error',
    'no-nested-ternary': 'error',
    'eqeqeq': 'error',
    'project/named-reatom': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/no-non-null-assertion': 'error',
    'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
    'typescript/consistent-type-imports': 'error',
    'typescript/ban-ts-comment': ['error', { 'ts-expect-error': true }],
    'typescript/no-floating-promises': ['error', { ignoreVoid: false }],
    'typescript/no-misused-promises': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/no-unnecessary-condition': 'error',
    'typescript/strict-boolean-expressions': 'error',
    'typescript/switch-exhaustiveness-check': 'error',
    'typescript/only-throw-error': 'error',
    'typescript/require-await': 'error',
    'typescript/no-deprecated': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unnecessary-type-arguments': 'error',
    'typescript/no-unsafe-enum-comparison': 'error',
    'typescript/use-unknown-in-catch-callback-variable': 'error',
    'typescript/no-confusing-void-expression': 'error',
    'typescript/restrict-plus-operands': 'error',
    'typescript/prefer-promise-reject-errors': 'error',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
  },
  overrides: [
    {
      files: ['src/renderer/**/*.tsx', 'docs-lint/{examples,rejected}/**/*.tsx'],
      rules: { 'project/tracked-render': 'error', 'project/component-file': 'error', 'project/pagination-in-view': 'error' },
    },
    {
      files: ['src/renderer/**/*.{ts,tsx}', 'docs-lint/{examples,rejected}/**/*.{ts,tsx}'],
      rules: {
        'project/react-state': 'error',
        'no-restricted-imports': ['error', {
          paths: [
            ...builtinModules,
            { name: 'react', importNames: stateHooks,
              message: 'Состояние хранится в модели Reatom. Подпишите представление через reatomComponent.' },
            { name: '@reatom/react', importNames: ['useAtom', 'useAction'], message: 'Используйте reatomComponent и wrap.' },
          ],
          patterns: [{ group: ['node:*', 'node:*/**', 'electron', 'electron/**'], message: 'Системные API вызываются в main.' }],
        }],
      },
    },
    {
      files: ['src/renderer/model/**/*.{ts,tsx}', 'docs-lint/{examples,rejected}/model/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', {
          paths: [...builtinModules],
          patterns: [{ group: ['node:*', 'node:*/**', 'electron', 'electron/**', 'react', 'react/*', 'react-dom', 'react-dom/*', '@reatom/react'], message: 'Модель зависит от @reatom/core. UI и системные API подключаются снаружи.' }],
        }],
      },
    },
  ],
})
