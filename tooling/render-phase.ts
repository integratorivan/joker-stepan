import type { Context, ESTree } from '@oxlint/plugins'
import { primitiveName } from './reatom-imports.ts'

export const componentWrapper = (node: ESTree.Node, context: Context) => {
  if (node.type !== 'CallExpression') return undefined
  const name = primitiveName(node.callee, context, '@reatom/react')
  if (name === 'reatomComponent' || name === 'reatomFactoryComponent') return name
  return undefined
}

export const enclosingFunction = (node: ESTree.Node) => {
  let parent = node.parent
  while (parent && parent.type !== 'Program') {
    if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionDeclaration'
        || parent.type === 'FunctionExpression') return parent
    parent = parent.parent
  }
  return undefined
}

export const factoryRender = (fn: NonNullable<ReturnType<typeof enclosingFunction>>, context: Context) => {
  const setup = enclosingFunction(fn)
  if (setup?.type !== 'ArrowFunctionExpression' || componentWrapper(setup.parent, context) !== 'reatomFactoryComponent') return false
  return setup.body === fn || fn.parent.type === 'ReturnStatement'
}

const iterators = new Set(['map', 'flatMap', 'filter', 'some', 'every', 'find', 'reduce'])

export const renderPhase = (node: ESTree.Node, context: Context) => {
  let owner = enclosingFunction(node)
  while (owner !== undefined) {
    let parent = owner.parent
    if (factoryRender(owner, context)) return 'tracked'
    if (parent.type === 'CallExpression') {
      const callee = parent.callee
      if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier'
          && iterators.has(callee.property.name)) {
        owner = enclosingFunction(parent)
        continue
      }
      if (parent.arguments[0] === owner) {
        const wrapper = componentWrapper(parent, context)
        if (wrapper === 'reatomFactoryComponent') return 'init'
        if (wrapper === 'reatomComponent') return 'tracked'
        parent = parent.parent
      }
    }
    if (parent.type === 'ExportDefaultDeclaration') return 'plain'
    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier' && /^[A-Z]/u.test(parent.id.name)) return 'plain'
    if (owner.type !== 'ArrowFunctionExpression' && owner.id && /^[A-Z]/u.test(owner.id.name)) return 'plain'
    return undefined
  }
  return undefined
}
