import { reatomComponent } from '@reatom/react'
import { SessionPanel } from '../sessions/session-panel'
import { Dashboard } from './dashboard'
import { SectionPage } from './section-page'
import { useWorkspace } from './workspace.context'

export const WorkspaceScreen = reatomComponent(() => {
  const route = useWorkspace().navigation.route()

  if (route.kind === 'dashboard') return <Dashboard />

  if (route.kind === 'session') return <SessionPanel key={route.id} />

  if (route.kind === 'section') return <SectionPage title={route.title} />

  return <SectionPage title="Страница не найдена" />
}, 'WorkspaceScreen')
