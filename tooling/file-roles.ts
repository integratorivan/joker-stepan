import { existsSync } from 'node:fs'
import { isBuiltin } from 'node:module'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'
import type { Role } from './file-roles.types.ts'

const sourceRoot = fileURLToPath(new URL('../src', import.meta.url))
const fixtureRoot = fileURLToPath(new URL('../docs-lint/rejected/architecture', import.meta.url))

// Order matters: `.domain.test.ts` and `.model.types.ts` must match before the shorter suffixes.
const suffixes: readonly (readonly [string, Role])[] = [
  ['.test.ts', 'test'], ['.types.ts', 'types'], ['.domain.ts', 'domain'], ['.constants.ts', 'constants'],
  ['.model.ts', 'model'], ['.adapter.ts', 'adapter'], ['.context.ts', 'context'], ['.tsx', 'view'],
]

const roleOf = (path: string): Role | undefined => {
  const parts = path.split(sep)
  if (parts[0] === 'main') return 'main'
  if (path === join('renderer', 'main.tsx')) return 'root'
  const name = parts[2]
  if (parts[0] !== 'features' || parts.length !== 3 || name === undefined) return undefined
  return suffixes.find(([suffix]) => name.endsWith(suffix))?.[1]
}

const localImports: Record<Role, readonly Role[]> = {
  domain: ['domain', 'types', 'constants'],
  types: ['types'],
  constants: ['constants', 'types'],
  model: ['model', 'domain', 'types', 'constants'],
  adapter: ['adapter', 'domain', 'types', 'constants'],
  context: ['context', 'types'],
  view: ['view', 'context', 'domain', 'types', 'constants'],
  test: ['domain', 'types', 'constants'],
  root: ['adapter', 'model', 'view', 'context', 'domain', 'types', 'constants'],
  main: ['main', 'domain', 'types', 'constants'],
}

const packages: Record<Exclude<Role, 'main'>, readonly string[]> = {
  domain: [], constants: [], test: ['vitest'],
  types: ['@reatom/core', 'react'],
  model: ['@reatom/core'],
  adapter: ['@reatom/core', 'ky'],
  context: ['react'],
  view: ['react', '@reatom/core', '@reatom/react', '@base-ui/react'],
  root: ['react', 'react-dom', '@reatom/core', '@reatom/react'],
}

const roleNames: Record<Role, string> = {
  domain: 'Доменный файл (*.domain.ts)', types: 'Файл типов (*.types.ts)', constants: 'Файл констант (*.constants.ts)',
  model: 'Модель (*.model.ts)', adapter: 'Адаптер (*.adapter.ts)', context: 'React-контекст (*.context.ts)',
  view: 'Компонент (*.tsx)', test: 'Тест (*.test.ts)', root: 'Точка сборки renderer', main: 'Main-процесс',
}

// The fix depends on who imports: a domain file needs different advice than a component.
const sourceHints: Partial<Record<Role, string>> = {
  domain: 'Оставьте здесь чистые функции над данными из *.types.ts и *.constants.ts. Состояние держите в *.model.ts.',
  types: 'Импортируйте только другие *.types.ts через import type.',
  constants: 'Импортируйте только другие *.constants.ts и типы.',
  test: 'Тестируйте чистые функции из *.domain.ts. Модель и адаптер проверяются запуском приложения.',
}

const targetHints: Partial<Record<Role, string>> = {
  adapter: 'Адаптер подключается только в src/renderer/main.tsx. Опишите нужные возможности интерфейсом в *.types.ts и передайте реализацию в фабрику модели.',
  model: 'Компонент получает модель через useWorkspace() из workspace/workspace.context.ts. Тип модели импортируйте из *.model.types.ts.',
  view: 'Компоненты подключают другие компоненты и src/renderer/main.tsx.',
  context: 'Контекст React читают только компоненты.',
  root: 'Точку сборки не импортирует никто.',
  main: 'Код main-процесса доступен renderer только через IPC.',
  test: 'Тесты не импортируются из кода.',
}

const resolveModule = (path: string) =>
  [path, path + '.ts', path + '.tsx'].find(candidate => existsSync(candidate)) ?? path + '.ts'

export const fileRoles = defineRule({
  meta: { messages: {
    location: 'Положите файл в src/features/<фича>/ и укажите роль суффиксом: .domain.ts, .model.ts, .adapter.ts, .context.ts, .types.ts, .constants.ts, .test.ts или .tsx. Точки входа: src/renderer/main.tsx и src/main/. См. docs/architecture.md.',
    dependency: '{{role}} не импортирует {{target}}. {{hint}}',
    package: '{{role}} не использует пакет {{name}}. Разрешено: {{allowed}}.',
    literal: 'Укажите путь к модулю строковым литералом, чтобы линтер проверил границу.',
    missingTest: 'Добавьте рядом {{test}} с тестами vitest для функций этого файла.',
    orphanTest: 'Положите тест рядом с проверяемым файлом: {{source}} не найден.',
  } },
  create(context) {
    const file = resolve(context.filename)
    const root = file.startsWith(fixtureRoot + sep) ? fixtureRoot : sourceRoot
    const role = roleOf(relative(root, file))
    if (role === undefined) return { Program(node) { context.report({ node, messageId: 'location' }) } }

    const check = (source: ESTree.Node) => {
      if (source.type !== 'Literal' || typeof source.value !== 'string') {
        context.report({ node: source, messageId: 'literal' })
        return
      }
      const name = source.value
      if (name.startsWith('.')) {
        const target = roleOf(relative(root, resolveModule(resolve(dirname(file), name))))
        if (target !== undefined && localImports[role].includes(target)) return
        const hint = sourceHints[role] ?? (target === undefined ? '' : targetHints[target]) ?? ''
        context.report({ node: source, messageId: 'dependency', data: { role: roleNames[role], target: name, hint } })
        return
      }
      if (role === 'main') {
        if (isBuiltin(name) || name === 'electron' || name.startsWith('electron/')) return
        context.report({ node: source, messageId: 'package', data: { role: roleNames[role], name, allowed: 'модули Node и electron' } })
        return
      }
      const allowed = packages[role]
      if (allowed.some(pkg => name === pkg || name.startsWith(pkg + '/'))) return
      context.report({ node: source, messageId: 'package', data: {
        role: roleNames[role], name, allowed: allowed.length === 0 ? 'без пакетов' : allowed.join(', '),
      } })
    }

    const siblings = (node: ESTree.Program) => {
      const name = basename(file)
      if (role === 'domain') {
        const test = name.replace(/\.ts$/u, '.test.ts')
        if (!existsSync(join(dirname(file), test))) context.report({ node, messageId: 'missingTest', data: { test } })
      }
      if (role === 'test') {
        const source = name.replace(/\.test\.ts$/u, '.ts')
        if (!existsSync(join(dirname(file), source))) context.report({ node, messageId: 'orphanTest', data: { source } })
      }
    }

    return {
      Program: siblings,
      ImportDeclaration(node) { check(node.source) },
      ExportNamedDeclaration(node) { if (node.source !== null) check(node.source) },
      ExportAllDeclaration(node) { check(node.source) },
      ImportExpression(node) { check(node.source) },
      TSImportType(node) { check(node.source) },
      TSExternalModuleReference(node) { check(node.expression) },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          const source = node.arguments[0]
          if (source !== undefined) check(source)
        }
      },
    }
  },
})
