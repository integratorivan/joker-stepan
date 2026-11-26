import { describe, expect, it } from 'vitest'
import { createSession, enqueueDraft, messageText, replaceSession } from './session.domain'

const ids = (...values: string[]) => () => values.shift() ?? 'лишний вызов'

describe('createSession', () => {
  it('нумерует сессию и начинает с пустого черновика и очереди', () => {
    expect(createSession('a', 3)).toEqual({ id: 'a', title: 'Сессия 3', model: '', draft: '', queue: [] })
  })
})

describe('messageText', () => {
  it('убирает крайние пробелы черновика', () => {
    expect(messageText({ ...createSession('a', 1), draft: '  привет \n' })).toBe('привет')
  })
})

describe('enqueueDraft', () => {
  it('добавляет сообщение в конец очереди и очищает черновик', () => {
    const session = { ...createSession('a', 1), draft: '  второе ', queue: [{ id: 'm1', text: 'первое' }] }

    expect(enqueueDraft(session, ids('m2'))).toEqual({
      ...session,
      draft: '',
      queue: [{ id: 'm1', text: 'первое' }, { id: 'm2', text: 'второе' }],
    })
  })

  it('не меняет сессию с пробельным черновиком и не запрашивает ID', () => {
    const nextId = ids()

    expect(enqueueDraft({ ...createSession('a', 1), draft: ' \n ' }, nextId)).toBeUndefined()
    expect(nextId()).toBe('лишний вызов')
  })
})

describe('replaceSession', () => {
  const first = createSession('a', 1)
  const second = createSession('b', 2)

  it('заменяет сессию с тем же ID на прежнем месте', () => {
    const changed = { ...first, draft: 'черновик' }

    expect(replaceSession([first, second], changed)).toEqual([changed, second])
  })

  it('добавляет новую сессию в конец', () => {
    expect(replaceSession([first], second)).toEqual([first, second])
  })
})
