import { Sidebar } from './sidebar'
import { WorkspaceScreen } from './workspace-screen'

export const Workspace = () => (
  <div className="grid gap-4 p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
    <Sidebar />
    <main className="min-w-0"><WorkspaceScreen /></main>
  </div>
)
