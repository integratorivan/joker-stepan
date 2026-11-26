import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'
import { binding, primitiveName } from './reatom-imports.ts'

const callbackIndex = new Map([
  ['action', 0], ['computed', 0], ['effect', 0],
  ['withCallHook', 0], ['withChangeHook', 0], ['withConnectHook', 0], ['withErrorHook', 0],
  ['addCallHook', 1], ['addChangeHook', 1], ['addErrorHook', 1],
])

function isFunction(node: ESTree.Node) {
  return node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration'
}

export const wrappedAwait = defineRule({
  meta: { messages: { wrap: 'Оберните промис в wrap из @reatom/core. См. docs-lint/examples/async-action.ts.' } },
  create(context) {
    const callbacks = new Set<ESTree.Node>()
    const awaits: ESTree.AwaitExpression[] = []
    return {
      CallExpression(node) {
        const name = primitiveName(node.callee, context)
        const index = typeof name === 'string' ? callbackIndex.get(name) : undefined
        if (index === undefined) return
        const argument = node.arguments[index]
        if (argument === undefined) return
        if (argument.type !== 'Identifier') {
          callbacks.add(argument)
          return
        }
        const definition = binding(argument, context)
        if (definition?.node.type === 'FunctionDeclaration') callbacks.add(definition.node)
        if (definition?.node.type === 'VariableDeclarator' && definition.node.init !== null
            && definition.parent?.type === 'VariableDeclaration' && definition.parent.kind === 'const') {
          callbacks.add(definition.node.init)
        }
      },
      AwaitExpression(node) {
        const awaited = node.argument
        if (awaited.type !== 'CallExpression' || primitiveName(awaited.callee, context) !== 'wrap') awaits.push(node)
      },
      'Program:exit'() {
        for (const node of awaits) {
          let owner = node.parent
          while (owner.type !== 'Program' && !isFunction(owner)) owner = owner.parent
          if (callbacks.has(owner)) context.report({ node, messageId: 'wrap' })
        }
      },
    }
  },
})
