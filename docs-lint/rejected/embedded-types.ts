export interface Session {
  id: string
  queue: { text: string }[]
}

type SessionId = Session['id']
export const sessionPath = (id: SessionId) => `/sessions/${id}`
export const getTitle = (session: { title: string }) => session.title
