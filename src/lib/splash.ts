import SIZES from './splash-sizes.json';

// 기상청 단기예보가 3시간마다 새로 나와서, 그만큼 지났을 때만 로딩 화면을 다 보여준다. 그 안엔 저장된 화면(sw.js)을 바로 띄운다
export const SPLASH_FULL_EVERY_MS = 3 * 60 * 60 * 1000;
export const SPLASH_SHOWN_KEY = 'splash-shown-at';

// 홈 화면 앱이 자리 잡은 뒤 실제로 쓰는 높이. 다음에 열 때 로딩 화면 높이로 쓴다(기종과 상관없이 맞음)
export const APP_HEIGHT_KEY = 'app-height';

// 저장된 높이가 없는 첫 실행용. "가로x세로@배율" → 상태 표시줄 높이(XS Max·XR처럼 크기가 같아도 배율로 나뉜다)
export const STATUS_BARS: Record<string, number> = Object.fromEntries(
  SIZES.map(({ width, height, ratio, statusBar }) => [
    `${width}x${height}@${ratio}`,
    statusBar,
  ])
);

// iOS 홈 화면 앱은 기기 크기·배율·테마가 맞는 그림만 시작 화면에 쓴다. 그림은 scripts/make_splash.mjs로 만든다
export const startupImages = (['dark', 'light'] as const).flatMap((theme) =>
  SIZES.map(({ width, height, ratio }) => ({
    url: `/splash/logo_splash_${width * ratio}x${height * ratio}_${theme}.png`,
    media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait) and (prefers-color-scheme: ${theme})`,
  }))
);
