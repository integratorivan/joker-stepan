import { atom, withSessionStorage } from '@reatom/core'
import { replaceSession } from './session.domain'
import type { Session, SessionStore } from './session.types'

const sessions = atom<Session[]>([], 'sessionStorage.sessions').extend(withSessionStorage('joker-stepan.sessions'))

export const sessionStorageStore = {
  list: () => sessions(),
  save: (session: Session) => { sessions.set(list => replaceSession(list, session)) },
  subscribe: (listener: () => void) => sessions.subscribe(() => { listener() }),
} satisfies SessionStore
