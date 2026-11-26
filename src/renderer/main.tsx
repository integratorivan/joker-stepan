import { clearStack, context } from '@reatom/core'
import { reatomContext } from '@reatom/react'
import { createRoot } from 'react-dom/client'
import { Workspace } from './workspace'

const root = document.getElementById('root')
if (root === null) throw new Error('В index.html отсутствует #root')

clearStack()
createRoot(root).render(
  <reatomContext.Provider value={context.start()}>
    <Workspace />
  </reatomContext.Provider>,
)
