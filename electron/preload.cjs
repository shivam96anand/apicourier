const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fetchToken: (config) => ipcRenderer.invoke('fetch-token', config),
    makeApiCall: (config) => ipcRenderer.invoke('make-api-call', config),
    getFolders: () => ipcRenderer.invoke('get-folders'),
    saveFolders: (folders) => ipcRenderer.invoke('save-folders', folders),
});
