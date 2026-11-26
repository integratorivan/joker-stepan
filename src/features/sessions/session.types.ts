export interface SessionMessage {
  id: string
  text: string
}

export interface Session {
  id: string
  title: string
  model: string
  draft: string
  queue: SessionMessage[]
}

export type SessionChange = Partial<Pick<Session, 'draft' | 'model'>>

export interface SessionStore {
  list(): readonly Session[]
  save(session: Session): void
  subscribe(listener: () => void): () => void
}
