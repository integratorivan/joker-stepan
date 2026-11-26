import { withConnectHook as onConnect } from '@reatom/core'
import { count } from '../../src/renderer/model/counter'

count.extend(onConnect(() => {}))
export const Title = () => <h1>Данные</h1>
