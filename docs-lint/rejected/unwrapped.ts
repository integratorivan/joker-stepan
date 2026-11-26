import { action } from '@reatom/core'

async function saveDraft(persist: () => Promise<void>) {
  await persist()
}

export const save = action(saveDraft, 'draft.save')
