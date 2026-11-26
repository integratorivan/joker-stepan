import { computed } from '@reatom/core'
import { parseRoute, sessionPath } from './navigation.domain'
import type { Navigation, NavigationModel } from './navigation.model.types'

export const createNavigationModel = (navigation: Navigation): NavigationModel => ({
  path: navigation.path,
  route: computed(() => parseRoute(navigation.path()), 'navigation.route'),
  href: navigation.href,
  sessionHref: id => navigation.href(sessionPath(id)),
  openSession: id => { navigation.open(sessionPath(id)) },
})
