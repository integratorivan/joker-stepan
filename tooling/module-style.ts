import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'
import { binding } from './reatom-imports.ts'

const unwrapTypeExpression = (
  node: ESTree.ExportDefaultDeclaration['declaration'] | null,
): ESTree.ExportDefaultDeclaration['declaration'] | null => {
  if (node?.type === 'TSSatisfiesExpression' || node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion'
      || node?.type === 'TSNonNullExpression' || node?.type === 'TSInstantiationExpression') {
    return unwrapTypeExpression(node.expression)
  }
  return node
}

const isArrowBinding = (node: ESTree.IdentifierReference, context: Context) => {
  const declaration = binding(node, context)?.node
  return declaration?.type === 'VariableDeclarator' && unwrapTypeExpression(declaration.init)?.type === 'ArrowFunctionExpression'
}

export const constFunctions = defineRule({
  meta: { messages: {
    arrow: 'Объявите функцию стрелкой через const. См. docs-lint/examples/sessions.api.ts.',
    named: 'Добавьте export к объявлению const со стрелкой. См. docs-lint/examples/sessions.api.ts.',
  } },
  create(context) {
    if (/\.d\.[cm]?ts$/u.test(context.filename)) return {}
    return {
      FunctionDeclaration(node) { context.report({ node, messageId: 'arrow' }) },
      VariableDeclarator(node) {
        const value = unwrapTypeExpression(node.init)
        if (value?.type === 'FunctionExpression' || (value?.type === 'ArrowFunctionExpression'
            && node.parent.type === 'VariableDeclaration' && node.parent.kind !== 'const')) {
          context.report({ node, messageId: 'arrow' })
        }
      },
      ExportDefaultDeclaration(node) {
        const value = unwrapTypeExpression(node.declaration)
        if (value?.type === 'ArrowFunctionExpression' || value?.type === 'FunctionExpression'
            || (value?.type === 'Identifier' && isArrowBinding(value, context))) {
          context.report({ node, messageId: 'named' })
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source !== null || node.exportKind === 'type') return
        for (const specifier of node.specifiers) {
          if (specifier.exportKind !== 'type' && specifier.local.type === 'Identifier' && isArrowBinding(specifier.local, context)) {
            context.report({ node: specifier, messageId: 'named' })
          }
        }
      },
    }
  },
})

const typeOnlyStatement = (node: ESTree.Statement | ESTree.Declaration) => {
  if (node.type === 'ImportDeclaration') return node.importKind === 'type'
  if (node.type === 'ExportAllDeclaration') return node.exportKind === 'type'
  if (node.type === 'ExportNamedDeclaration' && node.declaration === null) {
    return node.exportKind === 'type' || (node.source === null && node.specifiers.length === 0)
  }
  const declaration = node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration' ? node.declaration : node
  return declaration?.type === 'TSInterfaceDeclaration' || declaration?.type === 'TSTypeAliasDeclaration'
    || (declaration !== null && 'declare' in declaration && (declaration.declare ?? false))
}

export const separateTypes = defineRule({
  meta: { messages: {
    separate: 'Вынесите тип в соседний .types.ts и подключите через import type. См. docs-lint/examples/sessions.types.ts.',
    runtime: 'Перенесите исполняемый код в соседний модуль. Оставьте в .types.ts объявления и импорты типов.',
  } },
  create(context) {
    if (/\.d\.[cm]?ts$/u.test(context.filename)) return {}
    if (/\.types\.[cm]?ts$/u.test(context.filename)) return {
      Program(node) {
        for (const statement of node.body) {
          if (!typeOnlyStatement(statement)) context.report({ node: statement, messageId: 'runtime' })
        }
      },
    }
    return {
      'TSInterfaceDeclaration, TSTypeAliasDeclaration'(node) { context.report({ node, messageId: 'separate' }) },
      TSTypeLiteral(node) {
        let parent = node.parent
        while (parent.type !== 'Program') {
          if (parent.type === 'TSTypeAliasDeclaration' || parent.type === 'TSInterfaceDeclaration' || parent.type === 'TSTypeLiteral') return
          parent = parent.parent
        }
        context.report({ node, messageId: 'separate' })
      },
    }
  },
})

// Plain data: literals, templates without expressions, arrays and objects of data. References count only inside containers.
const isData = (node: ESTree.Expression | ESTree.SpreadElement | null, nested = false): boolean => {
  const value = node?.type === 'SpreadElement' ? null : unwrapTypeExpression(node)
  if (value === null) return false
  if (value.type === 'Literal') return true
  if (value.type === 'Identifier') return nested
  if (value.type === 'TemplateLiteral') return value.expressions.length === 0
  if (value.type === 'UnaryExpression') return value.operator === '-' && isData(value.argument, nested)
  if (value.type === 'ArrayExpression') return value.elements.every(element => isData(element, true))
  if (value.type === 'ObjectExpression') {
    return value.properties.every(property => property.type === 'Property' && property.kind === 'init'
      && !property.method && isData(property.value, true))
  }
  return false
}

export const constantsFile = defineRule({
  meta: { messages: {
    move: 'Перенесите константу {{name}} в соседний *.constants.ts и импортируйте её оттуда.',
    runtime: 'В *.constants.ts оставьте экспортируемые данные. Функции перенесите в *.domain.ts.',
  } },
  create(context) {
    if (/\.(?:d|types|test)\.[cm]?tsx?$/u.test(context.filename)) return {}
    if (/\.constants\.[cm]?ts$/u.test(context.filename)) return {
      Program(node) {
        for (const statement of node.body) {
          if (statement.type === 'ImportDeclaration') continue
          const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : null
          const valid = declaration?.type === 'VariableDeclaration' && declaration.kind === 'const'
            && declaration.declarations.every(item => isData(item.init))
          if (!valid) context.report({ node: statement, messageId: 'runtime' })
        }
      },
    }
    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== 'VariableDeclaration') return
        for (const item of node.declaration.declarations) {
          if (item.id.type === 'Identifier' && isData(item.init)) {
            context.report({ node: item, messageId: 'move', data: { name: item.id.name } })
          }
        }
      },
    }
  },
})

const componentName = (filename: string) => (filename.split(/[\\/]/u).at(-1) ?? '')
  .replace(/\.tsx$/u, '').split(/[-.]/u).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')

export const filenameExport = defineRule({
  meta: { messages: {
    mismatch: 'Назовите экспорт компонента по имени файла: {{expected}}. Или переименуйте файл по компоненту.',
  } },
  create(context) {
    if (!context.filename.endsWith('.tsx')) return {}
    const expected = componentName(context.filename)
    return {
      Program(node) {
        const names = node.body.flatMap(statement => {
          if (statement.type !== 'ExportNamedDeclaration') return []
          if (statement.declaration?.type === 'VariableDeclaration') {
            return statement.declaration.declarations.flatMap(item => item.id.type === 'Identifier' ? [item.id.name] : [])
          }
          return statement.specifiers.flatMap(item => item.exported.type === 'Identifier' ? [item.exported.name] : [])
        })
        if (!names.includes(expected)) context.report({ node, messageId: 'mismatch', data: { expected } })
      },
    }
  },
})

export const noBarrel = defineRule({
  meta: { messages: {
    reexport: 'Импортируйте модуль по пути к его файлу. Реэкспорт скрывает, где лежит код.',
  } },
  create(context) {
    return {
      ExportAllDeclaration(node) { context.report({ node, messageId: 'reexport' }) },
      ExportNamedDeclaration(node) { if (node.source !== null) context.report({ node, messageId: 'reexport' }) },
    }
  },
})

export const promiseChains = defineRule({
  meta: { messages: {
    chain: 'Дождитесь промиса через await вместо .{{method}}(). В action Reatom используйте await wrap(promise).',
    catch: 'Оберните await в try/catch. Вызов .catch() допустим только в конце отдельной инструкции, когда синхронный обработчик запускает промис.',
  } },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return
        const method = callee.property.name
        if (method === 'then' || method === 'finally') context.report({ node: callee.property, messageId: 'chain', data: { method } })
        if (method === 'catch' && node.parent.type !== 'ExpressionStatement') context.report({ node: callee.property, messageId: 'catch' })
      },
    }
  },
})
