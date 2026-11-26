export const next = () => Promise.resolve(1).then(value => value + 1)
export const fallback = () => Promise.resolve(1).catch(() => 0)
