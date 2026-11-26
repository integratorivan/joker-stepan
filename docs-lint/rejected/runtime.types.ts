export interface SessionId {
  id: string
}

export const sessionPath = (session: SessionId) => `/sessions/${session.id}`
