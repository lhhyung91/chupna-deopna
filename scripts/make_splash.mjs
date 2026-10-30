// iOS 홈 화면 앱 시작 화면을 기기 크기·테마별로 만든다. 사용: node scripts/make_splash.mjs
// sharp는 Next가 이미지 최적화용으로 함께 설치한 것을 쓴다.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZES = JSON.parse(
  await readFile(new URL('../src/lib/splash-sizes.json', import.meta.url))
);

// 그림을 넣으면 앱 로딩 화면과 위치·서체가 어긋나 두 화면처럼 보여서, 로딩 화면 바탕색(globals.css --bg)만 둔다
const BACKGROUNDS = { dark: '#141413', light: '#f1efe8' };

const outDir = new URL('../public/splash/', import.meta.url);
await mkdir(outDir, { recursive: true });

for (const [theme, background] of Object.entries(BACKGROUNDS)) {
  for (const { width, height, ratio } of SIZES) {
    const w = width * ratio;
    const h = height * ratio;
    const name = `logo_splash_${w}x${h}_${theme}.png`;
    await sharp({ create: { width: w, height: h, channels: 3, background } })
      .png({ compressionLevel: 9, palette: true })
      .toFile(fileURLToPath(new URL(name, outDir)));
    console.log(name);
  }
}
