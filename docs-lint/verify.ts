import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const oxlint = join(dirname(require.resolve('oxlint/package.json')), 'bin', 'oxlint')

const lint = (directory: string, expectedStatus: number) => {
  const result = spawnSync(process.execPath, [oxlint, '--deny-warnings', '--format=json', directory], {
    encoding: 'utf8',
  })
  if (result.error !== undefined) throw result.error
  assert.equal(result.status, expectedStatus, result.stderr + result.stdout)
  const report: unknown = JSON.parse(result.stdout)
  assert(report !== null && typeof report === 'object' && 'diagnostics' in report)
  assert('number_of_files' in report && typeof report.number_of_files === 'number' && report.number_of_files > 0)
  assert(Array.isArray(report.diagnostics))
  const diagnostics: unknown[] = report.diagnostics
  return diagnostics.map(item => {
    assert(item !== null && typeof item === 'object' && 'code' in item && 'filename' in item)
    assert(typeof item.code === 'string' && typeof item.filename === 'string')
    assert('labels' in item && Array.isArray(item.labels))
    const label: unknown = item.labels[0]
    assert(label !== null && typeof label === 'object' && 'span' in label)
    const { span } = label
    assert(span !== null && typeof span === 'object' && 'line' in span && typeof span.line === 'number')
    return item.filename.replaceAll('\\', '/').slice(directory.length + 1) + ':' + String(span.line) + ' ' + item.code
  }).toSorted()
}

assert.deepEqual(lint('docs-lint/examples', 0), [])
assert.deepEqual(lint('docs-lint/rejected', 1), [
  ...[1, 5, 6, 10, 11].map(line => 'function-declarations.ts:' + String(line) + ' project(const-functions)'),
  'default-arrow.ts:1 project(const-functions)',
  ...[1, 6, 8].map(line => 'embedded-types.ts:' + String(line) + ' project(separate-types)'),
  'runtime.types.ts:5 project(separate-types)',
  'nonlocal-props.tsx:3 project(component-file)',
  'architecture/features/sessions/helpers.ts:1 project(file-roles)',
  'architecture/features/sessions/queue.test.ts:1 project(file-roles)',
  ...[1, 2].map(line => 'architecture/features/sessions/session-card.tsx:' + String(line) + ' project(file-roles)'),
  'architecture/features/sessions/session-link.tsx:1 eslint(no-restricted-globals)',
  'architecture/features/sessions/session.domain.ts:1 project(file-roles)',
  'architecture/features/sessions/session.domain.ts:1 project(file-roles)',
  'architecture/features/sessions/sessions.model.ts:1 project(file-roles)',
  'architecture/features/sessions/sessions.model.ts:3 eslint(no-restricted-globals)',
  'architecture/main/index.ts:1 project(file-roles)',
  'architecture/stray.ts:1 project(file-roles)',
  ...[1, 2].map(line => 'barrel.ts:' + String(line) + ' project(no-barrel)'),
  ...[1, 2].map(line => 'promise-chain.ts:' + String(line) + ' project(promise-chains)'),
  'loose-constant.ts:1 project(constants-file)',
  'runtime.constants.ts:2 project(constants-file)',
  'memo-hook.ts:1 eslint(no-restricted-imports)',
  'memo-hook.ts:1 eslint(no-restricted-imports)',
  'naming/wrong-name.tsx:1 project(filename-export)',
  ...[3, 4, 5].map(line => 'cramped-branches.tsx:' + String(line) + ' project(component-file)'),
  'factory-init.tsx:5 project(tracked-render)',
  'factory-return.tsx:4 project(component-file)',
  'model-in-render.tsx:6 project(tracked-render)',
  'static-wrapper.tsx:3 project(tracked-render)',
  ...[4, 5, 8].map(line => 'snapshot.ts:' + String(line) + ' project(peek-usage)'),
  'peek-render.tsx:5 project(tracked-render)',
  'lifecycle-view.tsx:4 project(resource-lifecycle)',
  'repeated-hook.ts:6 project(resource-lifecycle)',
  ...[6, 7, 11].map(line => 'double-async.ts:' + String(line) + ' project(async-extensions)'),
  'pagination-view.tsx:6 project(pagination-in-view)',
  'pagination-view.tsx:7 project(pagination-in-view)',
  'pagination-view.tsx:7 project(tracked-render)',
  'floating.ts:2 typescript(no-floating-promises)',
  'model/ui-import.ts:1 eslint(no-restricted-imports)',
  'system-import.ts:1 eslint(no-restricted-imports)',
  'unchecked.ts:2 typescript(consistent-type-assertions)',
  'unchecked.ts:2 typescript(no-unsafe-type-assertion)',
  'mutable-view.tsx:2 project(component-file)',
  'mutable-view.tsx:9 project(component-file)',
  'plain-component.tsx:4 project(const-functions)',
  'render-props.tsx:3 project(separate-types)',
  'plain-component.tsx:5 project(react-state)',
  'plain-component.tsx:6 project(tracked-render)',
  'render-props.tsx:4 project(tracked-render)',
  'react-state.ts:1 eslint(no-restricted-imports)',
  'unwrapped.ts:4 project(wrapped-await)',
  ...[4, 5, 6].map(line => 'unnamed.ts:' + String(line) + ' project(named-reatom)'),
].toSorted())
const guideUrl = new URL('./project.html', import.meta.url)
const guide = readFileSync(guideUrl, 'utf8')
const excerpts = [...guide.matchAll(/<pre><code data-source="([^"]+)">([\s\S]*?)<\/code><\/pre>/gu)]
assert(excerpts.length > 0 && excerpts.length === guide.split('<pre>').length - 1, 'У каждого примера кода в HTML должен быть исходный файл')
for (const [, path, excerpt] of excerpts) {
  assert(path !== undefined && excerpt !== undefined && excerpt.length > 0)
  const source = readFileSync(new URL(path, guideUrl), 'utf8')
  const code = excerpt.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
  assert(source.includes(code), `Обновите в project.html пример из ${path}`)
}
console.info('docs-lint прошёл. Примеры и HTML проверены, все ожидаемые ошибки обнаружены.')
