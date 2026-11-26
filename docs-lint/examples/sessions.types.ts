export interface Session {
  readonly id: string
  readonly title: string
  readonly provider: 'Codex' | 'Claude'
}
