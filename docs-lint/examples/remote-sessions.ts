import { getSessions } from './sessions.api'
import { createSessions } from './sessions.reatom'

export const createRemoteSessions = (url: URL) => createSessions(signal => getSessions(url, signal))
