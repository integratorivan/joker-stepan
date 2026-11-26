export const Page = () => {
  let content = <h1>Страница</h1>

  if (window.location.hash === '#/dashboard') content = <h1>Дашборд</h1>

  return content
}

export const Sidebar = () => <aside />
