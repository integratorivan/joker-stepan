import type { NavigationModel } from '../navigation/navigation.model.types'
import type { SessionsModel } from '../sessions/sessions.model.types'

export interface WorkspaceModels {
  readonly navigation: NavigationModel
  readonly sessions: SessionsModel
}
