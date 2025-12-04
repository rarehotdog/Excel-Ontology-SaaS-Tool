const { contextBridge, ipcRenderer } = require('electron');

// 안전하게 API를 렌더러 프로세스에 노출
contextBridge.exposeInMainWorld('electronAPI', {
    // 플랫폼 정보
    platform: process.platform,
    
    // IPC 통신 (필요시 확장)
    send: (channel, data) => {
        const validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        const validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

