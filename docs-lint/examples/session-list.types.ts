import type { createSessions } from './sessions.reatom'

export interface SessionListProps {
  readonly sessions: ReturnType<typeof createSessions>
}
