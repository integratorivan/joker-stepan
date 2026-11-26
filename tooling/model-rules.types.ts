import type { ESTree } from '@oxlint/plugins'

export type AsyncExtension = 'withAsync' | 'withAsyncData'

export interface SnapshotRead {
  call: ESTree.CallExpression
  value: ESTree.Expression
  owner: ESTree.Node
}
