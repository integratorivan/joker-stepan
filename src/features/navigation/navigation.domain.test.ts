import { describe, expect, it } from 'vitest'
import { parseRoute, sessionPath } from './navigation.domain'

describe('sessionPath', () => {
  it('строит путь сессии, который parseRoute разбирает обратно', () => {
    expect(parseRoute(sessionPath('abc'))).toEqual({ kind: 'session', id: 'abc' })
  })
})

describe('parseRoute', () => {
  it('узнаёт дашборд', () => {
    expect(parseRoute('/dashboard')).toEqual({ kind: 'dashboard' })
  })

  it('возвращает заголовок раздела', () => {
    expect(parseRoute('/tools')).toEqual({ kind: 'section', title: 'Чем пользуюсь' })
  })

  it('помечает неизвестный путь', () => {
    expect(parseRoute('/nowhere')).toEqual({ kind: 'missing' })
  })
})
