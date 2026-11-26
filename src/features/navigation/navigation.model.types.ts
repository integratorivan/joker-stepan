import type { Computed } from '@reatom/core'
import type { Route } from './navigation.types'

export interface Navigation {
  readonly path: Computed<string>
  readonly open: (path: string) => void
  readonly href: (path: string) => string
}

export interface NavigationModel {
  readonly path: Computed<string>
  readonly route: Computed<Route>
  readonly href: (path: string) => string
  readonly sessionHref: (id: string) => string
  readonly openSession: (id: string) => void
}
