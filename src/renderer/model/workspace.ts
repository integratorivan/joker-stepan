import { action, atom, computed, onEvent, peek, withConnectHook, withSessionStorage } from '@reatom/core'

export const pages = [
  { path: '/dashboard', title: 'Дашборд' },
  { path: '/tasks', title: 'Задачи' },
  { path: '/documents', title: 'Документы' },
  { path: '/memory', title: 'Память' },
  { path: '/skills', title: 'Скиллы' },
  { path: '/tools', title: 'Чем пользуюсь' },
  { path: '/settings', title: 'Настройки' },
]

function readPath() {
  return window.location.hash.slice(1) || '/dashboard'
}

export const path = atom(readPath, 'workspace.path').extend(withConnectHook(target => {
  target.set(readPath())
  return onEvent(window, 'hashchange', () => target.set(readPath()))
}))

export interface Session {
  id: string
  title: string
  model: string
  draft: string
  queue: { id: string; text: string }[]
}

export const sessions = atom<Session[]>([], 'workspace.sessions').extend(
  withSessionStorage('joker-stepan.sessions'),
)

export function sessionPath(id: string) {
  return `/sessions/${id}`
}

export const currentPage = computed(() => {
  const current = path()
  return pages.find(page => page.path === current)
}, 'workspace.currentPage')
export const currentSession = computed(() => {
  const current = path()
  return sessions().find(session => sessionPath(session.id) === current)
}, 'workspace.currentSession')

export const createSession = action(() => {
  const id = crypto.randomUUID()
  const title = `Сессия ${peek(sessions).length + 1}`
  sessions.set(list => [...list, { id, title, model: '', draft: '', queue: [] }])
  window.location.hash = sessionPath(id)
}, 'workspace.createSession')

export const updateSession = action((id: string, change: Partial<Pick<Session, 'draft' | 'model'>>) => {
  sessions.set(list => list.map(session => session.id === id ? { ...session, ...change } : session))
}, 'workspace.updateSession')

export const enqueue = action((id: string) => {
  sessions.set(list => list.map(session => {
    const text = session.draft.trim()
    if (session.id !== id || text.length === 0) return session
    return { ...session, draft: '', queue: [...session.queue, { id: crypto.randomUUID(), text }] }
  }))
}, 'workspace.enqueue')
