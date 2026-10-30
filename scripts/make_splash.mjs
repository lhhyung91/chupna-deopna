// iOS 홈 화면 앱 시작 화면을 기기 크기·테마별로 만든다. 사용: node scripts/make_splash.mjs
// sharp는 Next가 이미지 최적화용으로 함께 설치한 것을 쓴다.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZES = JSON.parse(
  await readFile(new URL('../src/lib/splash-sizes.json', import.meta.url))
);

// 앱 로딩 화면(SplashScreen) 첫 장면과 같은 색이라 시작 화면 → 로딩 화면이 끊기지 않는다
const THEMES = {
  dark: {
    background: '#141413',
    glow: 'rgb(255 167 122 / 0.16)',
    floor: 'rgb(255 167 122 / 0.22)',
    source: 'logo_splash_cloud_dark.png',
  },
  light: {
    background: '#f1efe8',
    glow: 'rgb(255 167 122 / 0.18)',
    floor: 'rgb(40 30 10 / 0.16)',
    source: 'logo_splash_cloud_light.png',
  },
};

// 로딩 화면에서 잰 배치(CSS px, 화면 가운데 기준). 로딩 화면을 바꾸면 같이 바꾼다
const CLOUD = { size: 208, dy: -77 };
const GLOW = { size: 420, dy: -60 };
const FLOOR = { width: 128, height: 12, dy: 3 };

// SVG는 rgb() 공백 문법을 못 읽어서 stop-opacity로 나눈다
const stop = (color, offset) => {
  const [, r, g, b, a] = color.match(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/);
  return `<stop offset="${offset}" stop-color="rgb(${r},${g},${b})" stop-opacity="${offset === 0 ? a : 0}"/>`;
};

const glowLayer = (w, h, ratio, { glow, floor }) => {
  const cx = w / 2;
  const glowY = h / 2 + GLOW.dy * ratio;
  const floorY = h / 2 + FLOOR.dy * ratio;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="glow">${stop(glow, 0)}${stop(glow, 1)}</radialGradient>
      <radialGradient id="floor">${stop(floor, 0)}${stop(floor, 1)}</radialGradient>
    </defs>
    <circle cx="${cx}" cy="${glowY}" r="${(GLOW.size / 2) * ratio}" fill="url(#glow)"/>
    <ellipse cx="${cx}" cy="${floorY}" rx="${(FLOOR.width / 2) * ratio}" ry="${(FLOOR.height / 2) * ratio}" fill="url(#floor)"/>
  </svg>`);
};

const outDir = new URL('../public/splash/', import.meta.url);
await mkdir(outDir, { recursive: true });

for (const [theme, colors] of Object.entries(THEMES)) {
  const sourcePath = fileURLToPath(
    new URL(`splash/${colors.source}`, import.meta.url)
  );
  for (const { width, height, ratio } of SIZES) {
    const w = width * ratio;
    const h = height * ratio;
    const size = CLOUD.size * ratio;
    const cloud = await sharp(sourcePath).resize(size).toBuffer();
    const name = `logo_splash_${w}x${h}_${theme}.png`;
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 3,
        background: colors.background,
      },
    })
      .composite([
        { input: glowLayer(w, h, ratio, colors) },
        {
          input: cloud,
          left: Math.round((w - size) / 2),
          top: Math.round(h / 2 + CLOUD.dy * ratio - size / 2),
        },
      ])
      .png({ compressionLevel: 9, palette: true })
      .toFile(fileURLToPath(new URL(name, outDir)));
    console.log(name);
  }
}
