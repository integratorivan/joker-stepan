export interface SessionComposerProps {
  readonly model: string
  readonly draft: string
  readonly canSubmit: boolean
  readonly onModelChange: (value: string) => void
  readonly onDraftChange: (value: string) => void
  readonly onSubmit: () => void
}
