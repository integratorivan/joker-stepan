import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'
import type { AsyncExtension, SnapshotRead } from './model-rules.types.ts'
import { inspectTypes, isStateUnit } from './inspect-types.ts'
import { binding, primitiveName } from './reatom-imports.ts'
import { enclosingFunction } from './render-phase.ts'

const constValue = (node: ESTree.Expression, context: Context) => {
  if (node.type !== 'Identifier') return undefined
  const def = binding(node, context)
  if (def?.parent?.type === 'VariableDeclaration' && def.parent.kind === 'const'
      && def.node.type === 'VariableDeclarator') return def.node.init
  return undefined
}

const extendedTarget = (node: ESTree.CallExpression) => {
  const { callee } = node
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier'
      && callee.property.name === 'extend' && callee.object.type !== 'Super') return callee.object
  return undefined
}

const asyncExtensionsOn = (call: ESTree.CallExpression, context: Context) => {
  const kinds = new Set<AsyncExtension>()
  for (const arg of call.arguments) {
    if (arg.type === 'SpreadElement') continue
    const extension = constValue(arg, context) ?? arg
    if (extension.type !== 'CallExpression') continue
    const kind = primitiveName(extension.callee, context)
    if (kind === 'withAsync' || kind === 'withAsyncData') kinds.add(kind)
  }
  return kinds
}

export const asyncExtensions = defineRule({
  meta: { messages: { double: 'withAsyncData уже подключает withAsync. Оставьте withAsyncData и передайте настройки в него.' } },
  create(context) {
    const statements = new Map<ESTree.Node, Map<ESTree.Node, Set<AsyncExtension>>>()
    return {
      CallExpression(node) {
        let target: ESTree.Expression | undefined = extendedTarget(node)
        if (!target) return
        const kinds = asyncExtensionsOn(node, context)
        if (kinds.size === 0) return
        // Two imperative .extend() calls on the same unit in the same statement list.
        if (target.type === 'Identifier' && node.parent.type === 'ExpressionStatement') {
          const block = node.parent.parent
          const def = binding(target, context)
          if (def && (block.type === 'BlockStatement' || block.type === 'Program')) {
            const units = statements.get(block) ?? new Map<ESTree.Node, Set<AsyncExtension>>()
            for (const kind of units.get(def.node) ?? []) kinds.add(kind)
            units.set(def.node, kinds)
            statements.set(block, units)
          }
        }
        // Walk the receiver through chained calls and immutable local aliases.
        const visited = new Set<ESTree.Node>()
        while (target && !visited.has(target)) {
          visited.add(target)
          if (target.type === 'Identifier') {
            target = constValue(target, context) ?? undefined
            continue
          }
          if (target.type !== 'CallExpression' || !extendedTarget(target)) break
          for (const kind of asyncExtensionsOn(target, context)) kinds.add(kind)
          target = extendedTarget(target)
        }
        if (kinds.size === 2) context.report({ node, messageId: 'double' })
      },
    }
  },
})

const singleResult = (callback: NonNullable<ReturnType<typeof enclosingFunction>>) => {
  const { body } = callback
  if (body?.type !== 'BlockStatement') return body
  const [only] = body.body
  if (body.body.length === 1 && only?.type === 'ReturnStatement') return only.argument
  return undefined
}

export const peekUsage = defineRule({
  meta: { messages: {
    dependency: 'Такой computed возвращает только снимок. Для зависимости прочитайте атом напрямую.',
    snapshot: 'Для разового чтения состояния в команде используйте peek(atom). См. docs-lint/examples/pagination.reatom.ts.',
  } },
  create(context) {
    const snapshotOwners = new Set<ESTree.Node>()
    const reads: SnapshotRead[] = []
    return {
      CallExpression(node) {
        const primitive = primitiveName(node.callee, context)
        if (primitive === 'computed' || primitive === 'action' || primitive === 'withChangeHook' || primitive === 'withCallHook') {
          const argument = node.arguments[0]
          let callback: ESTree.Node | undefined = argument
          if (argument?.type === 'Identifier') {
            const definition = binding(argument, context)
            callback = definition?.node.type === 'FunctionDeclaration' ? definition.node : constValue(argument, context) ?? undefined
          }
          if (callback?.type !== 'ArrowFunctionExpression' && callback?.type !== 'FunctionExpression'
              && callback?.type !== 'FunctionDeclaration') return
          if (primitive !== 'computed') {
            snapshotOwners.add(callback)
            return
          }
          const result = singleResult(callback)
          if (result?.type === 'CallExpression' && primitiveName(result.callee, context) === 'peek') {
            context.report({ node: result, messageId: 'dependency' })
          }
          return
        }
        if (node.arguments.length !== 0 || node.callee.type === 'Super') return
        const owner = enclosingFunction(node)
        if (owner) reads.push({ call: node, value: node.callee, owner })
      },
      'Program:exit'() {
        inspectTypes(context, reads.filter(item => snapshotOwners.has(item.owner)), (item, type, checker) => {
          if (checker.getPropertyOfType(type, '__reatom') && isStateUnit(type)) {
            context.report({ node: item.call, messageId: 'snapshot' })
          }
        })
      },
    }
  },
})

const hooks = new Set(['withConnectHook', 'withDisconnectHook', 'withChangeHook', 'withCallHook', 'withErrorHook'])

export const lifecycle = defineRule({
  meta: { messages: {
    view: 'Подключайте lifecycle-поведение в модуле модели. См. docs-lint/examples/resource-lifecycle.ts.',
    repeated: 'Этот обработчик уже подключён таким же расширением. Объявите расширение один раз и переиспользуйте.',
  } },
  create(context) {
    const used = new Map<ESTree.Node, Set<string>>()
    return {
      CallExpression(node) {
        const name = primitiveName(node.callee, context)
        if (typeof name !== 'string' || !hooks.has(name)) return
        if (context.filename.endsWith('.tsx')) {
          context.report({ node, messageId: 'view' })
          return
        }
        const handler = node.arguments[0]
        if (handler?.type !== 'Identifier' || node.arguments.length !== 1
            || node.parent.type !== 'CallExpression' || extendedTarget(node.parent) === undefined) return
        const definition = binding(handler, context)
        if (!definition) return
        const names = used.get(definition.node) ?? new Set<string>()
        if (names.has(name)) context.report({ node, messageId: 'repeated' })
        names.add(name)
        used.set(definition.node, names)
      },
    }
  },
})
