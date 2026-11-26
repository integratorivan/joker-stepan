import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'
import { binding, primitiveName } from './reatom-imports.ts'
import { componentWrapper, enclosingFunction, factoryRender } from './render-phase.ts'

export const componentFile = defineRule({
  meta: { fixable: 'whitespace', messages: {
    factory: 'Из инициализатора reatomFactoryComponent верните стрелку рендера. См. docs-lint/examples/page-counter.tsx.',
    spacing: 'Отделите ветку if пустой строкой. См. docs-lint/examples/session-list.tsx.',
    declaration: 'Объявите компонент через export const и стрелку. Реактивную стрелку передайте в reatomComponent.',
    multiple: 'Вынесите компонент в собственный .tsx файл.',
    props: 'Укажите именованный тип props из соседнего .ts файла.',
    types: 'Перенесите объявление типа в соседний .ts файл.',
    mutable: 'Используйте const и верните JSX непосредственно из ветки if.',
    model: 'Объявите модель Reatom в .ts модуле и импортируйте её в представление.',
  } },
  create(context) {
    let components = 0
    const renders = new Set<ESTree.Node>()

    function count(node: ESTree.Node) {
      components += 1
      if (components > 1) context.report({ node, messageId: 'multiple' })
    }

    function checkProps(parameter: ESTree.ArrowFunctionExpression['params'][number] | undefined, generic?: ESTree.TSType) {
      if (parameter === undefined && generic === undefined) return
      const annotation = parameter && 'typeAnnotation' in parameter ? parameter.typeAnnotation?.typeAnnotation : undefined
      const type = annotation ?? generic
      const location = parameter ?? generic
      if (!location) return
      if (type?.type !== 'TSTypeReference' || type.typeName.type !== 'Identifier') {
        context.report({ node: location, messageId: 'props' })
        return
      }
      const declaration = binding(type.typeName, context)?.parent
      if (declaration?.type !== 'ImportDeclaration' || !/^\.\/[^/]+$/u.test(declaration.source.value)) {
        context.report({ node: location, messageId: 'props' })
      }
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || !/^[A-Z]/u.test(node.id.name)) return
        const init = node.init
        if (init?.type !== 'ArrowFunctionExpression' && init?.type !== 'FunctionExpression'
            && init?.type !== 'CallExpression') return
        if (init.type === 'CallExpression' && componentWrapper(init, context) === undefined
            && !init.arguments.some(arg => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression')) return
        count(node)
        const render = init.type === 'CallExpression' ? init.arguments[0] : init
        const valid = node.parent.type === 'VariableDeclaration' && node.parent.kind === 'const'
          && node.parent.parent.type === 'ExportNamedDeclaration' && render?.type === 'ArrowFunctionExpression'
          && (init.type !== 'CallExpression' || componentWrapper(init, context) !== undefined)
        if (!valid) context.report({ node, messageId: 'declaration' })
        if (render?.type === 'ArrowFunctionExpression' || render?.type === 'FunctionExpression') {
          if (render.body !== null && init.type === 'CallExpression' && componentWrapper(init, context) === 'reatomFactoryComponent'
              && render.body.type !== 'BlockStatement' && render.body.type !== 'ArrowFunctionExpression') {
            context.report({ node: render.body, messageId: 'factory' })
          }
          renders.add(render)
          checkProps(render.params[0], init.type === 'CallExpression' ? init.typeArguments?.params[0] : undefined)
        }
      },
      ReturnStatement(node) {
        const fn = enclosingFunction(node)
        if (fn && componentWrapper(fn.parent, context) === 'reatomFactoryComponent'
            && node.argument?.type !== 'ArrowFunctionExpression') context.report({ node, messageId: 'factory' })
      },
      ArrowFunctionExpression(node) {
        if (!factoryRender(node, context)) return
        renders.add(node)
        const param = node.params[0]
        if (param && 'typeAnnotation' in param && param.typeAnnotation) checkProps(param)
      },
      BlockStatement(node) {
        if (!renders.has(node.parent)) return

        for (const [index, next] of node.body.entries()) {
          const previous = node.body[index - 1]
          if (previous === undefined || (next.type !== 'IfStatement' && previous.type !== 'IfStatement')) continue

          // Check whitespace between tokens so blank lines inside comments do not count.
          const comments = context.sourceCode.getCommentsBefore(next)
          let end = previous.range[1]
          let hasBlank = false
          for (const token of [...comments, next]) {
            const gap = context.sourceCode.text.slice(end, token.range[0])
            if (/\r?\n[^\S\r\n]*\r?\n/u.test(gap)) hasBlank = true
            end = token.range[1]
          }
          if (hasBlank) continue

          // Keep a trailing comment with the previous statement and leading comments with the next.
          const first = comments.find(comment => comment.loc.start.line > previous.loc.end.line) ?? next
          const start = context.sourceCode.text.lastIndexOf('\n', first.range[0] - 1) + 1
          const newline = context.sourceCode.text.includes('\r\n') ? '\r\n' : '\n'
          context.report({
            node: next,
            messageId: 'spacing',
            fix: fixer => start > previous.range[1] && context.sourceCode.text.slice(start, first.range[0]).trim() === ''
              ? fixer.insertTextBeforeRange([start, start], newline)
              : null,
          })
        }
      },
      FunctionDeclaration(node) {
        if (node.parent.type !== 'ExportDefaultDeclaration' && !/^[A-Z]/u.test(node.id?.name ?? '')) return
        count(node)
        renders.add(node)
        context.report({ node, messageId: 'declaration' })
        checkProps(node.params[0])
      },
      ClassDeclaration(node) {
        if (node.superClass !== null && /^[A-Z]/u.test(node.id?.name ?? '')) {
          context.report({ node, messageId: 'declaration' })
        }
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type !== 'FunctionDeclaration') context.report({ node, messageId: 'declaration' })
      },
      VariableDeclaration(node) {
        if (node.kind !== 'let') return
        let parent = node.parent
        while (parent.type !== 'Program') {
          if (renders.has(parent)) {
            context.report({ node, messageId: 'mutable' })
            return
          }
          parent = parent.parent
        }
      },
      'TSInterfaceDeclaration, TSTypeAliasDeclaration'(node) {
        context.report({ node, messageId: 'types' })
      },
      CallExpression(node) {
        const factory = primitiveName(node.callee, context)
        if (factory === 'atom' || factory === 'computed' || factory === 'action' || factory === 'effect'
            || (typeof factory === 'string' && /^reatom[A-Z]/u.test(factory))) {
          context.report({ node, messageId: 'model' })
        }
      },
    }
  },
})
