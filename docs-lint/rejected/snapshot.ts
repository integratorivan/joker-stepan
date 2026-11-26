import { action, atom, computed, peek as snapshot } from '@reatom/core'

const count = atom(1, 'snapshot.count')
export const frozen = computed(() => snapshot(count), 'snapshot.frozen')
export const readCount = action(() => count(), 'snapshot.read')

export function logSnapshot(source: typeof count) {
  return action(() => source(), 'snapshot.fromParameter')
}
