import { action, atom, wrap } from '@reatom/core'

const status = atom('idle', 'draft.status')
export const save = action(async (persist: () => Promise<void>) => {
  await wrap(persist())
  status.set('saved')
}, 'draft.save')
