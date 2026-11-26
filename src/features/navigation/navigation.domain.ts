import { dashboardPath, sections, sessionPrefix } from './navigation.constants'
import type { Route } from './navigation.types'

export const sessionPath = (id: string) => sessionPrefix + id

export const parseRoute = (path: string): Route => {
  if (path === dashboardPath) return { kind: 'dashboard' }
  if (path.startsWith(sessionPrefix)) return { kind: 'session', id: path.slice(sessionPrefix.length) }
  const section = sections.find(item => item.path === path)
  if (section === undefined) return { kind: 'missing' }
  return { kind: 'section', title: section.title }
}
