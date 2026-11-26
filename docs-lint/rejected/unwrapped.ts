import { action } from '@reatom/core'

const saveDraft = async (persist: () => Promise<void>) => {
  await persist()
}

export const save = action(saveDraft, 'draft.save')
