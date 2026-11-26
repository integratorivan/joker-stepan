import { atom, onEvent, withConnectHook } from '@reatom/core'
import { dashboardPath } from './navigation.constants'
import type { Navigation } from './navigation.model.types'

const readPath = () => window.location.hash.slice(1) || dashboardPath

export const hashNavigation = {
  path: atom(readPath, 'navigation.path').extend(withConnectHook(target => {
    target.set(readPath())
    return onEvent(window, 'hashchange', () => target.set(readPath()))
  })),
  open: (path: string) => { window.location.hash = path },
  href: (path: string) => `#${path}`,
} satisfies Navigation
