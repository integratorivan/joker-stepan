import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'
import { binding } from './reatom-imports.ts'

export const stateHooks = ['useState', 'useReducer', 'useEffect', 'useLayoutEffect', 'useInsertionEffect']

export const derivedHooks = ['useMemo', 'useCallback']

const isReactObject = (node: ESTree.Expression, context: Context) => {
  if (node.type !== 'Identifier') return false
  const definition = binding(node, context)
  return definition?.parent?.type === 'ImportDeclaration' && definition.parent.source.value === 'react'
    && (definition.node.type === 'ImportDefaultSpecifier' || definition.node.type === 'ImportNamespaceSpecifier'
      || (definition.node.type === 'ImportSpecifier' && definition.node.imported.type === 'Identifier'
        && definition.node.imported.name === 'default'))
}

export const reactState = defineRule({
  meta: { messages: {
    hook: 'Вынесите состояние и эффекты в модель Reatom. См. docs-lint/examples/counter-button.tsx.',
    derived: 'Посчитайте значение в computed модели, а обработчик свяжите с действием через wrap. См. docs-lint/examples/counter-button.tsx.',
  } },
  create(context) {
    const check = (key: ESTree.Node, computed: boolean) => {
      let name: unknown
      if (key.type === 'Literal') name = key.value
      if (key.type === 'Identifier' && !computed) name = key.name
      if (typeof name !== 'string') return
      if (stateHooks.includes(name)) context.report({ node: key, messageId: 'hook' })
      if (derivedHooks.includes(name)) context.report({ node: key, messageId: 'derived' })
    }
    return {
      MemberExpression(node) {
        if (isReactObject(node.object, context)) check(node.property, node.computed)
      },
      VariableDeclarator(node) {
        if (node.id.type !== 'ObjectPattern' || node.init === null || !isReactObject(node.init, context)) return
        for (const property of node.id.properties) {
          if (property.type === 'Property') check(property.key, property.computed)
        }
      },
    }
  },
})
