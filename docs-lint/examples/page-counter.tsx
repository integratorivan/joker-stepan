import { wrap } from '@reatom/core'
import { reatomFactoryComponent } from '@reatom/react'
import { createPagination } from './pagination.reatom'
import type { PageCounterProps } from './page-counter.types'
import { PageLabel } from './page-label'

export const PageCounter = reatomFactoryComponent<PageCounterProps>(({ total }, { name }) => {
  const model = createPagination(total, name)

  return () => (
    <section>
      <PageLabel current={model.page()} total={model.pages()} />
      <button type="button" onClick={wrap(model.next)}>Следующая</button>
    </section>
  )
}, { name: 'PageCounter', deps: ['total'] })
