import { reatomFactoryComponent } from '@reatom/react'

const render = () => <span>Значение</span>
export const Value = reatomFactoryComponent(() => render, 'Value')
