import { reatomFactoryComponent as factory } from '@reatom/react'
import { count } from '../../src/renderer/model/counter'

export const Snapshot = factory(() => {
  const value = count()
  return () => <output>{value}</output>
}, 'Snapshot')
