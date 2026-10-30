// iOS 홈 화면 앱 시작 화면을 기기 크기·테마별로 만든다. 사용: node scripts/make_splash.mjs
// sharp는 Next가 이미지 최적화용으로 함께 설치한 것을 쓴다.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZES = JSON.parse(
  await readFile(new URL('../src/lib/splash-sizes.json', import.meta.url))
);

// 시작 화면에서 첫 화면으로 넘어갈 때 색이 이어지도록 앱 바탕색(globals.css --bg)과 같게 둔다
const THEMES = {
  dark: { background: '#141413', source: 'logo_splash_cloud_dark.png' },
  light: { background: '#f1efe8', source: 'logo_splash_cloud_light.png' },
};

// 구름이 화면 가로의 절반쯤 되게 한다
const CLOUD_RATIO = 0.5;

const outDir = new URL('../public/splash/', import.meta.url);
await mkdir(outDir, { recursive: true });

for (const [theme, { background, source }] of Object.entries(THEMES)) {
  const sourcePath = new URL(`splash/${source}`, import.meta.url);
  for (const { width, height, ratio } of SIZES) {
    const w = width * ratio;
    const h = height * ratio;
    const cloud = await sharp(fileURLToPath(sourcePath))
      .resize(Math.round(w * CLOUD_RATIO))
      .toBuffer();
    const name = `logo_splash_${w}x${h}_${theme}.png`;
    await sharp({ create: { width: w, height: h, channels: 3, background } })
      .composite([{ input: cloud, gravity: 'center' }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(fileURLToPath(new URL(name, outDir)));
    console.log(name);
  }
}
