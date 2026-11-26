import { builtinModules } from 'node:module'
import { defineConfig } from 'oxlint'

import { derivedHooks, stateHooks } from './tooling/react-state.ts'

const dom = 'DOM и URL доступны в *.adapter.ts. Модель получает их через интерфейс из *.model.types.ts.'
const navigation = 'Ссылку строит navigation.href(), переход выполняет модель навигации. Работа с URL — в navigation/hash-navigation.adapter.ts.'
const storage = 'Хранилище подключается в *.adapter.ts за интерфейсом, например SessionStore из sessions/session.types.ts.'
const network = 'Сеть — в *.adapter.ts через ky. См. docs-lint/examples/sessions.api.ts.'
const platformGlobals = [
  { name: 'window', message: dom }, { name: 'document', message: dom }, { name: 'self', message: dom },
  { name: 'location', message: navigation }, { name: 'history', message: navigation },
  { name: 'localStorage', message: storage }, { name: 'sessionStorage', message: storage }, { name: 'indexedDB', message: storage },
  { name: 'fetch', message: network }, { name: 'XMLHttpRequest', message: network }, { name: 'WebSocket', message: network },
  { name: 'navigator', message: 'Возможности браузера подключаются в *.adapter.ts.' },
  { name: 'crypto', message: 'Генератор ID передаётся фабрике модели параметром nextId из src/renderer/main.tsx.' },
]
const featureFiles = ['src/features/**/*.{ts,tsx}', 'docs-lint/rejected/architecture/features/**/*.{ts,tsx}']
const adapterFiles = ['src/features/**/*.adapter.ts', 'docs-lint/rejected/architecture/features/**/*.adapter.ts']

export default defineConfig({
  plugins: ['import', 'typescript', 'react', 'jsx-a11y', 'unicorn', 'oxc'],
  jsPlugins: ['./tooling/reatom.ts'],
  options: { typeAware: true },
  ignorePatterns: ['out/**'],
  categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
  rules: {
    'react/react-in-jsx-scope': 'off', // JSX is compiled with the automatic runtime.
    'project/async-extensions': 'error',
    'project/const-functions': 'error',
    'project/separate-types': 'error',
    'project/no-barrel': 'error',
    'project/promise-chains': 'error',
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
      files: ['src/**/*.{ts,tsx}', 'docs-lint/rejected/architecture/**/*.{ts,tsx}'],
      rules: { 'project/file-roles': 'error' },
    },
    {
      files: ['src/**/*.{ts,tsx}', 'docs-lint/{examples,rejected}/**/*.{ts,tsx}'],
      rules: { 'project/constants-file': 'error' },
    },
    {
      files: ['src/features/**/*.tsx', 'docs-lint/examples/**/*.tsx', 'docs-lint/rejected/naming/**/*.tsx'],
      rules: { 'project/filename-export': 'error' },
    },
    {
      files: featureFiles,
      rules: {
        'no-restricted-globals': ['error', ...platformGlobals],
        'no-restricted-properties': ['error', ...platformGlobals.map(({ name, message }) => ({ object: 'globalThis', property: name, message }))],
      },
    },
    {
      files: adapterFiles,
      rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' },
    },
    {
      files: ['src/{features,renderer}/**/*.tsx', 'docs-lint/{examples,rejected}/**/*.tsx'],
      rules: { 'project/tracked-render': 'error', 'project/component-file': 'error', 'project/pagination-in-view': 'error' },
    },
    {
      files: ['src/{renderer,features}/**/*.{ts,tsx}', 'docs-lint/{examples,rejected}/**/*.{ts,tsx}'],
      rules: {
        'project/react-state': 'error',
        'no-restricted-imports': ['error', {
          paths: [
            ...builtinModules,
            { name: 'react', importNames: stateHooks,
              message: 'Состояние хранится в модели Reatom. Подпишите представление через reatomComponent.' },
            { name: 'react', importNames: derivedHooks,
              message: 'Посчитайте значение в computed модели, а обработчик свяжите с действием через wrap.' },
            { name: '@reatom/react', importNames: ['useAtom', 'useAction'], message: 'Используйте reatomComponent и wrap.' },
          ],
          patterns: [{ group: ['node:*', 'node:*/**', 'electron', 'electron/**'], message: 'Системные API вызываются в main.' }],
        }],
      },
    },
    {
      files: ['src/features/**/*.model.ts', 'docs-lint/{examples,rejected}/model/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', {
          paths: [...builtinModules],
          patterns: [{ group: ['node:*', 'node:*/**', 'electron', 'electron/**', 'react', 'react/*', 'react-dom', 'react-dom/*', '@reatom/react'], message: 'Модель зависит от @reatom/core. UI и системные API подключаются снаружи.' }],
        }],
      },
    },
  ],
})
