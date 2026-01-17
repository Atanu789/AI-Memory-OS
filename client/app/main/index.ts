import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    // Try to load from Vite dev server on different ports
    const tryPorts = [5173, 5174, 5175, 5176];
    let portIndex = 0;
    
    const tryLoadUrl = () => {
      const port = tryPorts[portIndex];
      const url = `http://localhost:${port}`;
      
      mainWindow.loadURL(url).catch((err) => {
        console.error(`Failed to load from port ${port}:`, err);
        portIndex++;
        if (portIndex < tryPorts.length) {
          setTimeout(tryLoadUrl, 500);
        } else {
          console.error('Could not connect to Vite dev server on any port');
        }
      });
    };
    
    tryLoadUrl();
    mainWindow.webContents.openDevTools();
  } else {
    // Load from built files
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

// Mock IPC handlers (will be replaced with real implementations)
ipcMain.handle("dashboard:getTodaySummary", async () => {
  return {
    focusTime: 204,
    deepWorkPercentage: 72,
    contextSwitches: 4,
    activeTime: 284,
  };
});

ipcMain.handle("dashboard:getRecentInsights", async (_, limit: number) => {
  return [];
});

ipcMain.handle("mindmap:getMemoryGraph", async () => {
  return { nodes: [], edges: [] };
});

ipcMain.handle("memory:getById", async (_, id: string) => {
  return null;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
