import { reatomComponent } from '@reatom/react'
import { useWorkspace } from '../workspace/workspace.context'

export const SessionList = reatomComponent(() => {
  const { navigation, sessions } = useWorkspace()
  const list = sessions.list()
  const route = navigation.route()

  if (list.length === 0) return <p>Сессий пока нет.</p>

  return (
    <ul className="grid gap-1 pl-5">
      {list.map(session => (
        <li key={session.id}>
          <a href={navigation.sessionHref(session.id)}
            aria-current={route.kind === 'session' && route.id === session.id ? 'page' : undefined}
            className="aria-[current=page]:font-bold">{session.title}</a>
        </li>
      ))}
    </ul>
  )
}, 'SessionList')
