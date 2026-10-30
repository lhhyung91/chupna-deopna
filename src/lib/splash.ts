import SIZES from './splash-sizes.json';

// iOS 홈 화면 앱은 기기 크기·배율·테마가 맞는 그림만 시작 화면에 쓴다. 그림은 scripts/make_splash.mjs로 만든다
export const startupImages = (['dark', 'light'] as const).flatMap((theme) =>
  SIZES.map(({ width, height, ratio }) => ({
    url: `/splash/logo_splash_${width * ratio}x${height * ratio}_${theme}.png`,
    media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait) and (prefers-color-scheme: ${theme})`,
  }))
);
