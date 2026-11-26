import * as core from '@reatom/core'
import { withAsync as asyncState } from '@reatom/core'

const query = () => Promise.resolve(1)
const extra = asyncState()
export const first = core.computed(query, 'first').extend(core.withAsyncData(), extra)
export const second = core.computed(query, 'second').extend(asyncState()).extend(core.withAsyncData())

const third = core.computed(query, 'third')
third.extend(core.withAsyncData())
third.extend(extra)
