// src의 Tailwind 클래스가 정식 표기(h-[88px] → h-22 등)인지 Tailwind 자체 API로 검사한다.
import { __unstable__loadDesignSystem } from '@tailwindcss/node';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cssPath = path.join(root, 'src/app/globals.css');
const ds = await __unstable__loadDesignSystem(
  fs.readFileSync(cssPath, 'utf8'),
  {
    base: path.dirname(cssPath),
  }
);

const files = fs
  .readdirSync(path.join(root, 'src'), { recursive: true })
  .filter((file) => /\.(tsx|ts|css)$/.test(file))
  .map((file) => path.join(root, 'src', file));

const found = new Map();
for (const file of files) {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const token of line.split(/[\s'"`{}]+/)) {
        const candidate = token.replace(/[;,]$/, '');
        if (!candidate || candidate.length > 80) continue;
        // 실제 Tailwind 클래스로 해석되는 것만 본다
        if (!ds.candidatesToCss([candidate])[0]) continue;
        const [canonical] = ds.canonicalizeCandidates([candidate], { rem: 16 });
        if (canonical === candidate) continue;
        const key = `${candidate} → ${canonical}`;
        found.set(key, [
          ...(found.get(key) ?? []),
          `${path.relative(root, file)}:${i + 1}`,
        ]);
      }
    });
}

for (const [key, places] of found)
  console.log(key.padEnd(48), places.join(', '));
console.log(`정식 표기가 아닌 클래스 ${found.size}종류`);
process.exitCode = found.size > 0 ? 1 : 0;
