// iOS 홈 화면 앱 시작 그림을 실제 로딩 화면을 찍어 만든다. 사용: dev 서버(3000)를 켠 채 node scripts/make_splash.mjs
// 시작 그림이 로딩 화면과 똑같아야 앱이 뜨기 전부터 로딩 화면이 보이고, 넘어갈 때 두 화면처럼 끊기지 않는다.
// 브라우저 조작은 설치된 크롬을 DevTools 프로토콜로 직접 부른다(새 의존성 없음). sharp는 Next가 함께 설치한 것을 쓴다.
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const APP_URL = process.argv[2] ?? 'http://localhost:3000/';
const CHROME =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

const SIZES = JSON.parse(
  await readFile(new URL('../src/lib/splash-sizes.json', import.meta.url))
);
// 상태 표시줄 칸은 theme-color(앱 바탕색)로 칠해진다
const BACKGROUNDS = { dark: '#141413', light: '#f1efe8' };

// 첫 장면 그대로 찍는다: 움직임을 멈추고, 점은 애니메이션 첫 프레임처럼 흐리게, dev 표시는 숨긴다
const FREEZE_CSS = `
  nextjs-portal { display: none !important; }
  .splash-dot { opacity: 0.25 !important; transform: scale(0.8) !important; }
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const profile = await mkdtemp(join(tmpdir(), 'splash-chrome-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
      method: 'PUT',
    })
      .then((res) => res.json())
      .catch(() => undefined);
  }
  if (!target) throw new Error('크롬에 연결하지 못했어요');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method)();
      listeners.delete(msg.method);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, (msg) =>
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      );
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) =>
    new Promise((resolve) => listeners.set(method, resolve));

  await send('Page.enable');
  // 페이지 스크립트를 끄면 서버가 그린 로딩 화면이 걷히지 않고 첫 장면 그대로 남는다
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  const outDir = new URL('../public/splash/', import.meta.url);
  await mkdir(outDir, { recursive: true });

  for (const [theme, background] of Object.entries(BACKGROUNDS)) {
    for (const { width, height, ratio, statusBar } of SIZES) {
      // 기본 상태 표시줄은 화면 위를 차지하고, 웹 화면은 그 아래 남은 높이만 쓴다
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: height - statusBar,
        deviceScaleFactor: ratio,
        mobile: true,
      });
      await send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'prefers-color-scheme', value: theme },
          { name: 'prefers-reduced-motion', value: 'reduce' },
        ],
      });
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url: APP_URL });
      await loaded;
      await send('Runtime.evaluate', {
        expression: `(async () => {
          const style = document.createElement('style');
          style.textContent = ${JSON.stringify(FREEZE_CSS)};
          document.head.append(style);
          await document.fonts.ready;
        })()`,
        awaitPromise: true,
      });
      const { data } = await send('Page.captureScreenshot', {
        format: 'png',
      });
      const shot = Buffer.from(data, 'base64');

      const name = `logo_splash_${width * ratio}x${height * ratio}_${theme}.png`;
      await sharp({
        create: {
          width: width * ratio,
          height: height * ratio,
          channels: 3,
          background,
        },
      })
        .composite([{ input: shot, left: 0, top: statusBar * ratio }])
        .png({ compressionLevel: 9, palette: true, quality: 95 })
        .toFile(fileURLToPath(new URL(name, outDir)));
      console.log(name);
    }
  }
  ws.close();
} finally {
  // 크롬이 프로필에 쓰기를 마치고 끝난 뒤에 지운다
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill();
  await exited;
  await rm(profile, { recursive: true, force: true, maxRetries: 5 });
}
