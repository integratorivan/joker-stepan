import ky from 'ky'
import type { Session } from './sessions.types'

export function parseSessions(input: unknown): Session[] {
  if (!Array.isArray(input)) throw new Error('Ожидался список сессий')
  const rows: readonly unknown[] = input
  return rows.map(row => {
    if (typeof row !== 'object' || row === null
        || !('id' in row) || typeof row.id !== 'string'
        || !('title' in row) || typeof row.title !== 'string'
        || !('provider' in row) || (row.provider !== 'Codex' && row.provider !== 'Claude')) {
      throw new Error('Некорректная запись сессии')
    }
    return { id: row.id, title: row.title, provider: row.provider }
  })
}

// Повторной попыткой управляет ресурс через sessions.retry().
export async function getSessions(url: URL, signal: AbortSignal): Promise<Session[]> {
  const rows = await ky.get(url, { signal, retry: 0 }).json<unknown>()
  return parseSessions(rows)
}
