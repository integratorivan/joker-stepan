import type { Context, ESTree, Scope } from '@oxlint/plugins'

export function binding(identifier: ESTree.IdentifierReference, context: Context) {
  let scope: Scope | null = context.sourceCode.getScope(identifier)
  while (scope !== null) {
    const variable = scope.set.get(identifier.name)
    if (variable !== undefined) return variable.defs[0]
    scope = scope.upper
  }
  return undefined
}

function importedName(identifier: ESTree.IdentifierReference, context: Context, source: string) {
  const definition = binding(identifier, context)
  if (definition?.parent?.type !== 'ImportDeclaration'
      || definition.parent.source.value !== source) return undefined
  if (definition.node.type === 'ImportNamespaceSpecifier') return '*'
  if (definition.node.type !== 'ImportSpecifier') return undefined
  const { imported } = definition.node
  return imported.type === 'Identifier' ? imported.name : imported.value
}

export function primitiveName(callee: ESTree.CallExpression['callee'], context: Context, source = '@reatom/core') {
  if (callee.type === 'Identifier') return importedName(callee, context, source)
  if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier'
      || importedName(callee.object, context, source) !== '*') return undefined
  if (!callee.computed && callee.property.type === 'Identifier') return callee.property.name
  return callee.property.type === 'Literal' ? callee.property.value : undefined
}
