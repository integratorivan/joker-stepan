import { action, atom as state, computed } from '@reatom/core'

const title = state('', 'draft.title')
export const hasTitle = computed(() => title().trim().length > 0, 'draft.hasTitle')
export const clearTitle = action(() => title.set(''), 'draft.clearTitle')
