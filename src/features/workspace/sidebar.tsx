import { Button } from '@base-ui/react/button'
import { Separator } from '@base-ui/react/separator'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { sections } from '../navigation/navigation.constants'
import { SessionList } from '../sessions/session-list'
import { useWorkspace } from './workspace.context'

export const Sidebar = reatomComponent(() => {
  const { navigation, sessions } = useWorkspace()
  const current = navigation.path()
  return (
    <aside>
      <strong>StepanFactory</strong>
      <nav aria-label="Страницы">
        <ul className="grid list-none gap-1 p-0">
          {sections.map(item => (
            <li key={item.path}>
              <a href={navigation.href(item.path)} aria-current={current === item.path ? 'page' : undefined}
                className="aria-[current=page]:font-bold">{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Separator render={<hr />} />
      <nav aria-label="Сессии по проектам">
        <h2>Сессии</h2>
        <strong>StepanFactory</strong>
        <SessionList />
        <Button onClick={wrap(sessions.create)}>Новая сессия</Button>
      </nav>
    </aside>
  )
}, 'Sidebar')
