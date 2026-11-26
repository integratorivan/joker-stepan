import { Button } from '@base-ui/react/button'
import { Field } from '@base-ui/react/field'
import { Form } from '@base-ui/react/form'
import { Input } from '@base-ui/react/input'
import { Tabs } from '@base-ui/react/tabs'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { enqueue, updateSession } from './model/workspace'

import type { SessionViewProps } from './session.types'

export const SessionView = reatomComponent(({ session }: SessionViewProps) => (
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
        <Form className="grid max-w-xl gap-3" onFormSubmit={wrap(() => { enqueue(session.id) })}>
          <Field.Root className="grid gap-1">
            <Field.Label>Модель</Field.Label>
            <Input value={session.model} placeholder="По умолчанию"
              onValueChange={wrap(value => { updateSession(session.id, { model: value }) })} />
          </Field.Root>
          <Field.Root className="grid gap-1">
            <Field.Label>Сообщение</Field.Label>
            <Field.Control render={<textarea rows={3} />} value={session.draft}
              onValueChange={wrap(value => { updateSession(session.id, { draft: value }) })} />
          </Field.Root>
          <Button type="submit" className="justify-self-start" disabled={session.draft.trim().length === 0}>
            Добавить в очередь
          </Button>
        </Form>
      </Tabs.Panel>
      <Tabs.Panel value="changes"><p>В этой сессии пока нет изменений.</p></Tabs.Panel>
    </Tabs.Root>
  </>
), 'SessionView')
