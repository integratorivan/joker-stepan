import { action, atom, computed, withConnectHook, wrap } from '@reatom/core'
import type { NavigationModel } from '../navigation/navigation.model.types'
import { createSession, enqueueDraft, messageText } from './session.domain'
import type { Session, SessionChange, SessionStore } from './session.types'
import type { SessionsModel } from './sessions.model.types'

export const createSessionsModel = (
  store: SessionStore,
  navigation: NavigationModel,
  nextId: () => string,
): SessionsModel => {
  const list = atom<readonly Session[]>(() => store.list(), 'sessions.list').extend(withConnectHook(target =>
    store.subscribe(wrap(() => { target.set(store.list()) }))))
  const find = (id: string) => store.list().find(session => session.id === id)

  const current = computed(() => {
    const route = navigation.route()
    if (route.kind !== 'session') return undefined
    return list().find(session => session.id === route.id)
  }, 'sessions.current')

  const canEnqueue = computed(() => {
    const session = current()
    return session !== undefined && messageText(session).length > 0
  }, 'sessions.canEnqueue')

  return {
    list,
    current,
    canEnqueue,
    create: action(() => {
      const session = createSession(nextId(), store.list().length + 1)
      store.save(session)
      navigation.openSession(session.id)
    }, 'sessions.create'),
    update: action((id: string, change: SessionChange) => {
      const session = find(id)
      if (session !== undefined) store.save({ ...session, ...change })
    }, 'sessions.update'),
    enqueue: action((id: string) => {
      const session = find(id)
      const updated = session === undefined ? undefined : enqueueDraft(session, nextId)
      if (updated !== undefined) store.save(updated)
    }, 'sessions.enqueue'),
  }
}
