import { resolve } from 'node:path'
import type { Context } from '@oxlint/plugins'
import type { TypeProbe } from './inspect-types.types.ts'
import { API } from 'typescript/unstable/sync'
import type { Checker, Type } from 'typescript/unstable/sync'

// Resolve all probes for a file against one snapshot, including unsaved editor content.
export const inspectTypes = <T extends TypeProbe>(
  context: Context,
  candidates: T[],
  inspect: (item: T, type: Type, checker: Checker) => void,
) => {
  if (candidates.length === 0) return
  const file = resolve(context.filename)
  const api = new API({ fs: { readFile: name => name === file ? context.sourceCode.text : undefined } })
  try {
    const project = api.updateSnapshot({ openFiles: [file] }).getDefaultProjectForFile(file)
    if (project === undefined) throw new Error('TypeScript не загрузил ' + file)
    const { checker } = project
    const positions = candidates.map(({ value }) => value.type === 'MemberExpression' ? value.property.range[0] : value.range[0])
    const types = checker.getTypeAtPosition(file, positions)
    for (const [index, item] of candidates.entries()) {
      const type = types[index]
      if (type !== undefined) inspect(item, type, checker)
    }
  } finally {
    api.close()
  }
}

export const isStateUnit = (type: Type): boolean => {
  if (type.isIntersectionType()) return type.getTypes().some(isStateUnit)
  if (type.isUnionType()) return type.getTypes().every(isStateUnit)
  const name = type.getSymbol()?.name
  return name === 'Computed' || name === 'Atom' || (type.getBaseTypes()?.some(isStateUnit) ?? false)
}
