const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');


const dataFile = path.join(os.homedir(), '.api-tester-data.json');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
}

app.whenReady().then(createWindow);

ipcMain.handle('fetch-token', async (event, { tokenUrl, clientId, clientSecret }) => {
    try {
        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const json = await res.json();
        if (!res.ok) return { error: json.error_description || json.error || 'Token request failed' };
        return json.access_token || { error: 'access_token not found in response' };

    } catch (err) {
        return { error: err.message };
    }
});

ipcMain.handle('make-api-call', async (event, { url, method, token, headers = {}, body }) => {
    try {
        const res = await fetch(url, {
            method,
            headers: {
                ...headers,
                Authorization: token ? `Bearer ${token}` : undefined,
                'Content-Type': 'application/json',
            },
            body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();
        return {
            data,
            headers: Object.fromEntries(res.headers.entries()),
            status: res.status,
        };
    } catch (err) {
        return { error: err.message };
    }
});

// Persist folders on disk
ipcMain.handle('get-folders', () => {
    try {
        if (fs.existsSync(dataFile)) {
            return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        }
        return [];
    } catch (err) {
        return [];
    }
});

ipcMain.handle('save-folders', (event, folders) => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(folders, null, 2));
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});
