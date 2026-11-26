import React from 'react'
import { count as current } from '../examples/counter'

export function Counter() {
  const [offset] = React.useState(1)
  return <output>{current() + offset}</output>
}
