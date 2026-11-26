import React from 'react'
import { count as current } from '../../src/renderer/model/counter'

export function Counter() {
  const [offset] = React.useState(1)
  return <output>{current() + offset}</output>
}
