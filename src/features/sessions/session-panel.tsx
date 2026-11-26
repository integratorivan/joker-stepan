import { Tabs } from '@base-ui/react/tabs'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { useWorkspace } from '../workspace/workspace.context'
import { SessionComposer } from './session-composer'

export const SessionPanel = reatomComponent(() => {
  const { sessions } = useWorkspace()
  const session = sessions.current()

  if (session === undefined) return <h1>Страница не найдена</h1>

  return (
    <>
      <h1>{session.title}</h1>
      <Tabs.Root defaultValue="chat">
        <Tabs.List aria-label="Сессия" className="flex gap-2">
          <Tabs.Tab value="chat" className="data-active:font-bold">Чат</Tabs.Tab>
          <Tabs.Tab value="changes" className="data-active:font-bold">Изменения</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="chat">
          <h2>Очередь сообщений</h2>
          {session.queue.length === 0 ? <p>Очередь пуста.</p> : (
            <ol>{session.queue.map(message => <li key={message.id} className="whitespace-pre-wrap wrap-anywhere">{message.text}</li>)}</ol>
          )}
          <SessionComposer
            model={session.model}
            draft={session.draft}
            canSubmit={sessions.canEnqueue()}
            onModelChange={wrap(value => { sessions.update(session.id, { model: value }) })}
            onDraftChange={wrap(value => { sessions.update(session.id, { draft: value }) })}
            onSubmit={wrap(() => { sessions.enqueue(session.id) })}
          />
        </Tabs.Panel>
        <Tabs.Panel value="changes"><p>В этой сессии пока нет изменений.</p></Tabs.Panel>
      </Tabs.Root>
    </>
  )
}, 'SessionPanel')
