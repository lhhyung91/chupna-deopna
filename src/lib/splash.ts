import SIZES from './splash-sizes.json';

// 기상청 단기예보가 3시간마다 새로 나와서, 그만큼 지났을 때만 로딩 화면을 다 보여준다. 그 안엔 저장된 화면(sw.js)을 바로 띄운다
export const SPLASH_FULL_EVERY_MS = 3 * 60 * 60 * 1000;
export const SPLASH_SHOWN_KEY = 'splash-shown-at';

// iOS 홈 화면 앱은 기기 크기·배율·테마가 맞는 그림만 시작 화면에 쓴다. 그림은 scripts/make_splash.mjs로 만든다
export const startupImages = (['dark', 'light'] as const).flatMap((theme) =>
  SIZES.map(({ width, height, ratio }) => ({
    url: `/splash/logo_splash_${width * ratio}x${height * ratio}_${theme}.png`,
    media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait) and (prefers-color-scheme: ${theme})`,
  }))
);
