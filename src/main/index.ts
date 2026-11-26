import { join } from 'node:path'
import { app, BrowserWindow } from 'electron'

const icon = join(app.getAppPath(), 'resources', 'icon.png')

const openWindow = async () => {
  const window = new BrowserWindow({
    width: 720,
    height: 480,
    title: app.getName(),
    icon,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  })
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (!app.isPackaged && devUrl !== undefined) {
    await window.loadURL(devUrl)
  } else {
    await window.loadFile(join(import.meta.dirname, '../renderer/index.html'))
  }
}

const exitOnFailure = (error: unknown) => {
  console.error(error)
  app.exit(1)
}

const start = async () => {
  await app.whenReady()
  app.dock?.setIcon(icon)
  await openWindow()
}

start().catch(exitOnFailure)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openWindow().catch(exitOnFailure)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
