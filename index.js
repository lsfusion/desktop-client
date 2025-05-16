const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        },
        icon: path.join(__dirname, 'logo.png')
    });
    win.maximize();
    win.setMenuBarVisibility(false);
    win.loadFile('index.html');
    win.maximize();

    const filter = {
        urls: ["<all_urls>"]
    };

    session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
        const url = details.url;
        if (!url.endsWith('restricted.html') && details.resourceType === 'mainFrame') {
            const headers = details.responseHeaders;
            const poweredBy = headers['X-Powered-By'];

            const isAllowed = poweredBy && poweredBy.some(h => h.includes("lsFusion"));
            win.webContents.send('headers-checked', {url, isAllowed});
        }
        callback({cancel: false});
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
