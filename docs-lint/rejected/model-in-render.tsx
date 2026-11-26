import { reatomComponent } from '@reatom/react'
import { createPagination as make } from '../examples/pagination.reatom'
import { count } from '../examples/counter'

export const Pager = reatomComponent(() => {
  const model = make(count, 'pager')
  return <output>{model.page()}</output>
}, 'Pager')
