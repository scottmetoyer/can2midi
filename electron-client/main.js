const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false
  })

  win.loadFile('index.html')
  win.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('initial-load', function (event, arg) {
  event.sender.send('initial-load', app.getAppPath());
});

ipcMain.on('open-file-dialog', (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then((data) => {
    console.log(data.filePaths)
    event.sender.send('selected-file', data.filePaths[0])
  });
})

ipcMain.on('open-error-dialog', (event, arg) => {
  //console.log(arg)
  dialog.showErrorBox('Error', arg.toString())
})