export const Page = () => {
  const page = window.location.hash
  if (page === '#loading') return <output>Загрузка…</output>
  if (page === '#empty') return <p>Пусто</p>
  return <h1>Сессии</h1>
}
