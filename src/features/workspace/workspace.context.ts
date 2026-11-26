import { createContext, useContext } from 'react'
import type { WorkspaceModels } from './workspace.types'

export const WorkspaceContext = createContext<WorkspaceModels | null>(null)

export const useWorkspace = () => {
  const workspace = useContext(WorkspaceContext)
  if (workspace === null) throw new Error('Оберните интерфейс в WorkspaceContext.Provider в src/renderer/main.tsx')
  return workspace
}
