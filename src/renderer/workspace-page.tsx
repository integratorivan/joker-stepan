import { reatomComponent } from '@reatom/react'
import { currentPage, currentSession, path } from './model/workspace'
import { Dashboard } from './dashboard'
import { SessionView } from './session'

export const WorkspacePage = reatomComponent(() => {
  if (path() === '/dashboard') return <Dashboard />

  const session = currentSession()

  if (session !== undefined) return <SessionView key={session.id} session={session} />

  return <h1>{currentPage()?.title ?? 'Страница не найдена'}</h1>
}, 'WorkspacePage')
