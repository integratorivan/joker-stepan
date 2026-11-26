import { SessionList } from './session-list'

export const Dashboard = () => {
  return (
    <>
      <h1>Дашборд</h1>
      <section><h2>Сессии</h2><SessionList /></section>
      <section><h2>Вопросы</h2><p>Нет вопросов, ожидающих ответа.</p></section>
      <section><h2>Активная работа</h2><p>Нет запущенных агентов.</p></section>
    </>
  )
}
