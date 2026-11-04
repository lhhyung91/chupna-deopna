// 로딩 화면 구름 그림을 가볍게 다시 만든다. 사용: node scripts/make_cloud.mjs <원본 폴더>
// 원본 폴더엔 cloud-light-512.png·cloud-dark-512.png(투명 512px)가 있어야 한다. sharp는 Next가 함께 설치한 것을 쓴다.
// 설치 후 첫 실행엔 저장된 게 없어서, 그림이 무거우면 로딩 화면이 그려질 때 구름이 늦게 나와 시작 그림과 어긋난다.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// 글리치 질감은 색 품질을 낮춰도 잘 안 줄고, 투명도 품질을 낮춰야 줄어든다(눈으로는 차이 없음)
const QUALITY = 75;
const ALPHA_QUALITY = 30;

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error(
    '원본 폴더를 넣어 주세요: node scripts/make_cloud.mjs <원본 폴더>'
  );
  process.exit(1);
}

for (const theme of ['light', 'dark']) {
  const out = fileURLToPath(
    new URL(`../public/splash/cloud-${theme}-512.webp`, import.meta.url)
  );
  const { size } = await sharp(join(sourceDir, `cloud-${theme}-512.png`))
    .webp({ quality: QUALITY, alphaQuality: ALPHA_QUALITY, effort: 6 })
    .toFile(out);
  console.log(out, `${Math.round(size / 1024)}KB`);
}
