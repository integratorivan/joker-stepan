export const firstName = (input: unknown): string | undefined => {
  if (typeof input !== 'string') return undefined
  return input.trim().split(/\s+/u)[0]
}
