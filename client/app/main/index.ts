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
    // Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
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
