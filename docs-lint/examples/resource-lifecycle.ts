import { action, atom, withConnectHook } from '@reatom/core'

// Счётчик показывает число активных подписанных ресурсов.
const connected = atom(0, 'resources.connected')
const connect = action(() => {
  connected.set(n => n + 1)
  return () => connected.set(n => n - 1)
}, 'resources.connect')

const withConnectionCount = withConnectHook(connect)
export const first = atom(0, 'resources.first').extend(withConnectionCount)
export const second = atom(0, 'resources.second').extend(withConnectionCount)
