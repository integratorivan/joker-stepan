import type { Section } from './navigation.types'

export const dashboardPath = '/dashboard'

export const sessionPrefix = '/sessions/'

export const sections: readonly Section[] = [
  { path: dashboardPath, title: 'Дашборд' },
  { path: '/tasks', title: 'Задачи' },
  { path: '/documents', title: 'Документы' },
  { path: '/memory', title: 'Память' },
  { path: '/skills', title: 'Скиллы' },
  { path: '/tools', title: 'Чем пользуюсь' },
  { path: '/settings', title: 'Настройки' },
]
