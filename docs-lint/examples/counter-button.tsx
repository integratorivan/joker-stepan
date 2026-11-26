import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { count, increment } from './counter'

export const CounterButton = reatomComponent(() => (
  <button type="button" onClick={wrap(increment)}>{count()}</button>
), 'CounterButton')
