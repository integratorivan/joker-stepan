import type { Computed } from '@reatom/core'

export const Summary = ({ model }: { readonly model: { readonly title: Computed<string> } }) => (
  <h2>{model.title()}</h2>
)
