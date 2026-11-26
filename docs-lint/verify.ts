import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const oxlint = join(dirname(require.resolve('oxlint/package.json')), 'bin', 'oxlint')

function lint(directory: string, expectedStatus: number) {
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
  'plain-component.tsx:4 project(component-file)',
  'render-props.tsx:3 project(component-file)',
  'plain-component.tsx:5 project(react-state)',
  'plain-component.tsx:6 project(tracked-render)',
  'render-props.tsx:4 project(tracked-render)',
  'react-state.ts:1 eslint(no-restricted-imports)',
  'unwrapped.ts:4 project(wrapped-await)',
  ...[4, 5, 6].map(line => 'unnamed.ts:' + String(line) + ' project(named-reatom)'),
].toSorted())
console.info('docs-lint прошёл. Разрешённые примеры чисты, все ожидаемые ошибки обнаружены.')
