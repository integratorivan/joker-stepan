export function sessionPath(id: string) {
  return `/sessions/${id}`
}

const localPath = function (id: string) { return sessionPath(id) } satisfies (id: string) => string
export let route = (id: string) => localPath(id)
route = sessionPath

const pathFor = (id: string) => route(id)
export { pathFor }
export default pathFor
