import { action, atom, computed, peek } from '@reatom/core'
import type { Computed } from '@reatom/core'

export function createPagination(total: Computed<number>, name: string) {
  const page = atom(1, name + '.page')
  const pages = computed(() => Math.max(1, Math.ceil(total() / 20)), name + '.pages')
  const select = action((requested: number) => {
    page.set(Math.min(peek(pages), Math.max(1, requested)))
  }, name + '.select')

  const next = action(() => { select(peek(page) + 1) }, name + '.next')
  return { page, pages, next }
}
