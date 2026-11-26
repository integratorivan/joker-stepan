import { reatomComponent } from '@reatom/react'
import { path, sessionPath, sessions } from './model/workspace'

export const SessionList = reatomComponent(() => {
  if (sessions().length === 0) return <p>Сессий пока нет.</p>

  return (
    <ul className="grid gap-1 pl-5">
      {sessions().map(session => (
        <li key={session.id}>
          <a href={`#${sessionPath(session.id)}`}
            aria-current={path() === sessionPath(session.id) ? 'page' : undefined}
            className="aria-[current=page]:font-bold">{session.title}</a>
        </li>
      ))}
    </ul>
  )
}, 'SessionList')
