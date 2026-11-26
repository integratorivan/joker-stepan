import { Button } from '@base-ui/react/button'
import { Separator } from '@base-ui/react/separator'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { createSession, pages, path } from './model/workspace'
import { SessionList } from './session-list'
import { WorkspacePage } from './workspace-page'

export const Workspace = reatomComponent(() => {
  const current = path()
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
      <aside>
        <strong>StepanFactory</strong>
        <nav aria-label="Страницы">
          <ul className="grid list-none gap-1 p-0">
            {pages.map(item => (
              <li key={item.path}>
                <a href={`#${item.path}`} aria-current={current === item.path ? 'page' : undefined}
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
          <Button onClick={wrap(createSession)}>Новая сессия</Button>
        </nav>
      </aside>
      <main className="min-w-0"><WorkspacePage /></main>
    </div>
  )
}, 'Workspace')
