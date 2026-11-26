import { abortVar, computed, withAsyncData, wrap } from '@reatom/core'
import type { Session } from './sessions.types'

export const createSessions = (listSessions: (signal: AbortSignal) => Promise<Session[]>) => {
  return computed(async () => {
    const signal = abortVar.require().signal
    return wrap(listSessions(signal))
  }, 'sessions.list').extend(withAsyncData({ status: true }))
}
