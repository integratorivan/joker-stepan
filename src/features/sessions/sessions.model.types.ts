import type { Action, Computed } from '@reatom/core'
import type { Session, SessionChange } from './session.types'

export interface SessionsModel {
  readonly list: Computed<readonly Session[]>
  readonly current: Computed<Session | undefined>
  readonly canEnqueue: Computed<boolean>
  readonly create: Action<[], void>
  readonly update: Action<[id: string, change: SessionChange], void>
  readonly enqueue: Action<[id: string], void>
}
