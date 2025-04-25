const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadURL('http://localhost:3000');
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
        return json.access_token || json;
    } catch (err) {
        console.error("Main process token fetch error:", err);
        return { error: err.message };
    }
});

ipcMain.handle('make-api-call', async (event, { url, method, token, headers = {}, body }) => {
    try {
        const res = await fetch(url, {
            method,
            headers: {
                ...headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Main process API call error:", err);
        return { error: err.message };
    }
});
