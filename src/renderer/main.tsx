import { clearStack, context } from '@reatom/core'
import { reatomContext } from '@reatom/react'
import { createRoot } from 'react-dom/client'
import { hashNavigation } from '../features/navigation/hash-navigation.adapter'
import { createNavigationModel } from '../features/navigation/navigation.model'
import { sessionStorageStore } from '../features/sessions/session-storage.adapter'
import { createSessionsModel } from '../features/sessions/sessions.model'
import { Workspace } from '../features/workspace/workspace'
import { WorkspaceContext } from '../features/workspace/workspace.context'

const root = document.getElementById('root')
if (root === null) throw new Error('В index.html отсутствует #root')

const navigation = createNavigationModel(hashNavigation)
const sessions = createSessionsModel(sessionStorageStore, navigation, () => crypto.randomUUID())
const workspace = { navigation, sessions }

clearStack()
createRoot(root).render(
  <reatomContext.Provider value={context.start()}>
    <WorkspaceContext.Provider value={workspace}>
      <Workspace />
    </WorkspaceContext.Provider>
  </reatomContext.Provider>,
)
