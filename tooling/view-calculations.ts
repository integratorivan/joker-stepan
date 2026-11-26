import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'
import { binding } from './reatom-imports.ts'

// Match the two pagination formulas from the convention, leaving layout arithmetic in JSX available.
const mathMethod = (node: ESTree.Node | undefined, context: Context) => {
  if (node?.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') return undefined
  const { object, property, computed } = node.callee
  if (object.type !== 'Identifier' || object.name !== 'Math' || binding(object, context) || computed) return undefined
  return property.type === 'Identifier' ? property.name : undefined
}

export const paginationInView = defineRule({
  meta: { messages: { formula: 'Вычисляйте число страниц в computed и ограничивайте страницу в action. См. docs-lint/examples/pagination.reatom.ts.' } },
  create(context) {
    return {
      CallExpression(node) {
        const name = mathMethod(node, context)
        const ratio = name === 'ceil' && node.arguments[0]?.type === 'BinaryExpression' && node.arguments[0].operator === '/'
        const clamp = (name === 'min' || name === 'max') && node.arguments.some(arg =>
          mathMethod(arg, context) === (name === 'min' ? 'max' : 'min'))
        if (!ratio && !clamp) return
        const declaration = node.parent.type === 'VariableDeclarator' ? node.parent : node
        const hasPage = context.sourceCode.getTokens(declaration).some(token =>
          token.type === 'Identifier' && /(?:^page(?:$|[A-Z_])|Page(?:s?$|[A-Z_]))/u.test(token.value))
        if (hasPage) context.report({ node, messageId: 'formula' })
      },
    }
  },
})
