import { sessionStore } from './session-storage.adapter'
import { sessionsModel } from './sessions.model'

export const SessionCard = () => <p>{sessionStore.size() + sessionsModel.count}</p>
