import * as core from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { count } from '../examples/counter'

export const Frozen = reatomComponent(() => <output>{core.peek(count)}</output>, 'Frozen')
