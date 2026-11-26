export interface Section {
  readonly path: string
  readonly title: string
}

export type Route =
  | { readonly kind: 'dashboard' }
  | { readonly kind: 'section'; readonly title: string }
  | { readonly kind: 'session'; readonly id: string }
  | { readonly kind: 'missing' }
