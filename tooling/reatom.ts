import { definePlugin } from '@oxlint/plugins'
import { primitiveName } from './reatom-imports.ts'
import { wrappedAwait } from './reatom-async.ts'
import { componentFile } from './component-file.ts'
import { constantsFile, constFunctions, filenameExport, noBarrel, promiseChains, separateTypes } from './module-style.ts'
import { fileRoles } from './file-roles.ts'
import { reactState } from './react-state.ts'
import { trackedRender } from './reatom-render.ts'

import { asyncExtensions, lifecycle, peekUsage } from './model-rules.ts'
import { paginationInView } from './view-calculations.ts'

export default definePlugin({
  meta: { name: 'project' },
  rules: {
    'file-roles': fileRoles,
    'constants-file': constantsFile,
    'filename-export': filenameExport,
    'no-barrel': noBarrel,
    'promise-chains': promiseChains,
    'const-functions': constFunctions,
    'separate-types': separateTypes,
    'async-extensions': asyncExtensions,
    'resource-lifecycle': lifecycle,
    'peek-usage': peekUsage,
    'pagination-in-view': paginationInView,
    'component-file': componentFile,
    'react-state': reactState,
    'tracked-render': trackedRender,
    'wrapped-await': wrappedAwait,
    'named-reatom': {
      meta: { messages: { missing: 'Передайте имя вторым аргументом. См. docs-lint/examples/named-model.ts.' } },
      create(context) {
        return {
          CallExpression(node) {
            const name = primitiveName(node.callee, context)
            if (name !== 'atom' && name !== 'action' && name !== 'computed') return
            const label = node.arguments[1]
            if (label === undefined || (label.type === 'Identifier' && label.name === 'undefined')
                || (label.type === 'Literal' && (typeof label.value !== 'string' || label.value.trim() === ''))) {
              context.report({ node, messageId: 'missing' })
            }
          },
        }
      },
    },
  },
})
