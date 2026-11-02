// 바탕·카드에 까는 노이즈 타일을 만든다. 사용: node scripts/make_noise.mjs
// 검은 점과 흰 점을 섞어 한 장으로 라이트(어두운 점)·다크(밝은 점)를 다 덮는다. sharp는 Next가 함께 설치한 것을 쓴다.
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZE = 128;
// 점이 찍히는 픽셀 비율과 한 점의 최대 불투명도. 작은 회색 글씨가 흐려지지 않을 만큼만 둔다
const DENSITY = 0.5;
const MAX_ALPHA = 0.1;

// 다시 만들어도 같은 그림이 나오게 시드를 고정한다(mulberry32)
let seed = 20261103;
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const pixels = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < SIZE * SIZE; i++) {
  if (random() > DENSITY) continue;
  const shade = random() < 0.5 ? 0 : 255;
  pixels.set(
    [shade, shade, shade, Math.round(random() * MAX_ALPHA * 255)],
    i * 4
  );
}

const out = fileURLToPath(
  new URL('../src/app/texture_noise.png', import.meta.url)
);
await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(out);
console.log(out);
