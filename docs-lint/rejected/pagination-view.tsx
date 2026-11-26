import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { count } from '../examples/counter'

export const Pagination = reatomComponent(() => {
  const totalPages = Math.ceil(count() / 20)
  const reset = wrap(() => { count.set(Math.min(1, Math.max(0, totalPages))) })
  return <button type="button" onClick={reset}>{totalPages}</button>
}, 'Pagination')
