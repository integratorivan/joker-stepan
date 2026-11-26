import { action, atom } from '@reatom/core'

export const count = atom(0, 'counter.count')
export const increment = action(() => count.set(value => value + 1), 'counter.increment')
