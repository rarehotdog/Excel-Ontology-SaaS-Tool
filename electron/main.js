const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// 개발 모드 체크
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let backendProcess;

// 백엔드 서버 시작
function startBackend() {
    if (isDev) {
        // 개발 모드에서는 별도로 백엔드를 실행한다고 가정
        console.log('개발 모드: 백엔드는 별도로 실행해주세요.');
        return;
    }

    // 프로덕션에서 백엔드 실행
    const backendPath = path.join(process.resourcesPath, 'backend');
    const pythonPath = process.platform === 'darwin' 
        ? '/usr/bin/python3' 
        : 'python';

    backendProcess = spawn(pythonPath, [
        '-m', 'uvicorn', 
        'app.main:app', 
        '--host', '127.0.0.1', 
        '--port', '8000'
    ], {
        cwd: backendPath,
        env: { ...process.env, PYTHONPATH: backendPath }
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hiddenInset', // macOS 스타일
        icon: path.join(__dirname, '../public/icon.png'),
        show: false, // 로딩 완료 후 표시
    });

    // 개발 모드: localhost 로드
    // 프로덕션: 빌드된 파일 로드
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // 로딩 완료 후 창 표시
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // 외부 링크는 기본 브라우저에서 열기
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // 개발 모드에서 DevTools 열기
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 앱 준비 완료
app.whenReady().then(() => {
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 앱 종료 시 백엔드 프로세스도 종료
app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

