import { atom, withConnectHook } from '@reatom/core'

const connected = atom(0, 'units.connected')
const connect = () => { connected.set(n => n + 1) }
export const first = atom(0, 'units.first').extend(withConnectHook(connect))
export const second = atom(0, 'units.second').extend(withConnectHook(connect))
