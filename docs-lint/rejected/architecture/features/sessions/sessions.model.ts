import { sessionStore } from './session-storage.adapter'

export const sessionsModel = { count: sessionStore.size(), nextId: crypto.randomUUID() }
