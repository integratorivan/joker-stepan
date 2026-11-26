import { withConnectHook as onConnect } from '@reatom/core'
import { count } from '../examples/counter'

count.extend(onConnect(() => {}))
export const Title = () => <h1>Данные</h1>
