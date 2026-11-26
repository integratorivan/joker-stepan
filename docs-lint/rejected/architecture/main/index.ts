import { sessionStore } from '../features/sessions/session-storage.adapter'

export const size = () => sessionStore.size()
