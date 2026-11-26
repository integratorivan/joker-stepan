import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'
import { SignatureKind } from 'typescript/unstable/sync'
import type { Checker, Type } from 'typescript/unstable/sync'
import type { RenderCandidate } from './reatom-render.types.ts'
import { inspectTypes, isStateUnit } from './inspect-types.ts'
import { binding, primitiveName } from './reatom-imports.ts'
import { componentWrapper, enclosingFunction, renderPhase } from './render-phase.ts'

const producesModel = (checker: Checker, type: Type) => {
  const isUnit = (value: Type) => checker.getPropertyOfType(value, '__reatom') !== undefined
  if (isUnit(type)) return false
  return checker.getSignaturesOfType(type, SignatureKind.Call).some(signature => {
    const result = checker.getReturnTypeOfSignature(signature)
    if (result === undefined) return false
    return isUnit(result) || checker.getPropertiesOfType(result).some(property => {
      const field = checker.getTypeOfSymbol(property)
      return field !== undefined && isUnit(field)
    })
  })
}

const isCreateCall = (callee: ESTree.CallExpression['callee'], context: Context) => {
  if (callee.type === 'MemberExpression') return callee.property.type === 'Identifier' && /^create[A-Z]/u.test(callee.property.name)
  if (callee.type !== 'Identifier') return false
  const definition = binding(callee, context)?.node
  const name = definition?.type === 'ImportSpecifier' && definition.imported.type === 'Identifier'
    ? definition.imported.name : callee.name
  return /^create[A-Z]/u.test(name)
}

export const trackedRender = defineRule({
  meta: { messages: {
    read: 'Оберните компонент, читающий Reatom, в reatomComponent. См. docs-lint/examples/counter-button.tsx.',
    init: 'Прочитайте атом в возвращаемой функции рендера фабрики. См. docs-lint/examples/page-counter.tsx.',
    create: 'Создайте экземпляр модели в инициализаторе reatomFactoryComponent. См. docs-lint/examples/page-counter.tsx.',
    write: 'Изменяйте атом через действие модели. См. docs-lint/examples/pagination.reatom.ts.',
    peek: 'Для подписки во время рендера вызовите атом напрямую. См. docs-lint/examples/page-counter.tsx.',
    plain: 'Для JSX из props достаточно обычной стрелки. См. docs-lint/examples/page-label.tsx.',
  } },
  create(context) {
    const candidates: RenderCandidate[] = []
    const projections = new Set<ESTree.ArrowFunctionExpression>()
    return {
      CallExpression(node) {
        // A wrapper with lifecycle options or calls in its body may need a frame.
        const owner = enclosingFunction(node)
        if (owner?.type === 'ArrowFunctionExpression') projections.delete(owner)
        const callback = node.arguments[0]
        if (componentWrapper(node, context) === 'reatomComponent' && callback?.type === 'ArrowFunctionExpression'
            && (node.arguments.length === 1 || node.arguments[1]?.type === 'Literal')) {
          const expression = callback.body.type === 'BlockStatement' ? callback.body.body[0] : callback.body
          const output = expression?.type === 'ReturnStatement' ? expression.argument : expression
          if (output?.type === 'JSXElement' || output?.type === 'JSXFragment') projections.add(callback)
        }

        const { callee } = node
        if (callee.type === 'Super') return
        if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier' && callee.property.name === 'set'
            && !callee.computed && callee.object.type !== 'Super') {
          candidates.push({ call: node, value: callee.object, kind: 'write' })
        }

        const phase = renderPhase(node, context)
        if (phase === undefined) return
        if (phase !== 'init' && primitiveName(callee, context) === 'peek') context.report({ node, messageId: 'peek' })
        if (phase !== 'init' && isCreateCall(callee, context)) candidates.push({ call: node, value: callee, kind: 'create' })
        if (phase !== 'tracked' && node.arguments.length === 0) {
          candidates.push({ call: node, value: callee, kind: phase === 'init' ? 'init' : 'read' })
        }
      },
      'Program:exit'() {
        for (const node of projections) context.report({ node, messageId: 'plain' })
        inspectTypes(context, candidates, (item, type, checker) => {
          const report = item.kind === 'create' ? producesModel(checker, type)
            : checker.getPropertyOfType(type, '__reatom') !== undefined && (item.kind !== 'init' || isStateUnit(type))
          if (report) context.report({ node: item.call, messageId: item.kind })
        })
      },
    }
  },
})
