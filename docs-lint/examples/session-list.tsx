import { noop, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import type { SessionListProps } from './session-list.types'

export const SessionList = reatomComponent(({ sessions }: SessionListProps) => {
  const rows = sessions.data()

  if (sessions.status().isRejected) {
    // Ошибка повторной попытки уже отражена в sessions.status().
    const retry = wrap(() => { sessions.retry().catch(noop) })
    return <button type="button" onClick={retry}>Повторить загрузку</button>
  }

  if (rows === undefined) return <output>Загружаем сессии…</output>

  if (rows.length === 0) return <p>Сессий пока нет</p>

  return <ul>{rows.map(row => <li key={row.provider + row.id}>{row.title} · {row.provider}</li>)}</ul>
}, 'SessionList')
