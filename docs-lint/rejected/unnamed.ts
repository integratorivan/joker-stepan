import * as model from '@reatom/core'
import { atom as state } from '@reatom/core'

export const count = state(0)
export const doubled = model.computed(() => count() * 2, ' ')
export const reset = model.action(() => count.set(0))
