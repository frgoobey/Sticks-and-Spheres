const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

// --- ADD THIS LINE HERE ---
require('./server.js'); 
// --------------------------

// 1. Register the Custom Protocol (The "Roblox" way)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('forest-world', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('forest-world');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Since your server.js is now running inside the app, 
  // you can either load the file directly or use the local port.
  win.loadFile('index.html'); 

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('second-instance', (event, commandLine) => {
  const url = commandLine.pop();
  console.log("Launched via link:", url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});