import { action, atom, computed, peek, withAsync, withAsyncData } from '@reatom/core'

const value = atom(0, 'example.value')
const baseline = atom(0, 'example.baseline')
// Пересчитываем по value, baseline читаем один раз на пересчёт.
export const difference = computed(() => value() - peek(baseline), 'example.difference')
export const remember = action(() => baseline.set(peek(value)), 'example.remember')

// Команду допустимо вызвать из другой команды.
export const reset = action(() => { remember() }, 'example.reset')
export const load = computed(() => Promise.resolve(0), 'example.load').extend(withAsyncData())
export const save = action(() => Promise.resolve(), 'example.save').extend(withAsync())
