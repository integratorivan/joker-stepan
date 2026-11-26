import type { ESTree } from '@oxlint/plugins'

type RenderCheck = 'read' | 'init' | 'write' | 'create'
export interface RenderCandidate {
  kind: RenderCheck
  call: ESTree.CallExpression
  value: ESTree.Expression
}
