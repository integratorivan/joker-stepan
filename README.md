# StepanFactory

<img src="resources/icon.png" alt="Логотип StepanFactory — двое лесорубов пилят бревно" width="160">

Десктопное приложение на Electron, React и TypeScript. Каркас рабочего пространства использует Reatom, компоненты Base UI и Tailwind CSS для раскладки.

## Запуск

Нужен Node.js 24.15 или новее. В корне проекта выполните:

```sh
npm ci
npm run dev
```

Для запуска локальной production-сборки выполните `npm run build`, затем `npm start`. Сборка кладёт приложение в `out/`. При первой установке Electron скачивает бинарник для текущей платформы.

## Работа с кодом

- `src/main/` управляет окном Electron и системными API.
- `src/renderer/model/` содержит состояние и действия Reatom.
- `src/renderer/main.tsx` создаёт контекст и подписывает React на модель.
- `npm run check` проверяет типы, запускает Oxlint с информацией о типах и сверяет диагностики на примерах. Эта же команда выполняется перед сборкой.

Соглашения, примеры и порядок добавления правил собраны в [docs-lint](docs-lint/README.md).
