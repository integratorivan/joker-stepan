import type { Session } from './session.types'

export const createSession = (id: string, number: number): Session => ({
  id, title: `Сессия ${number}`, model: '', draft: '', queue: [],
})

export const messageText = (session: Session) => session.draft.trim()

export const enqueueDraft = (session: Session, nextId: () => string): Session | undefined => {
  const text = messageText(session)
  if (text.length === 0) return undefined
  return { ...session, draft: '', queue: [...session.queue, { id: nextId(), text }] }
}

export const replaceSession = (list: readonly Session[], session: Session): Session[] =>
  list.some(item => item.id === session.id)
    ? list.map(item => item.id === session.id ? session : item)
    : [...list, session]
