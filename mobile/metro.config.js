const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// 옷차림 기준 같은 로직은 웹과 같은 파일(루트 src)을 쓴다. 루트 node_modules까지 넣으면 웹의 React가 섞일 수 있어 src만 본다
config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, '../src'),
];

// NativeWind 기본 1rem은 14pt라 웹(375px 폭에서 16px)보다 작게 나온다. 같은 클래스가 같은 크기가 되게 맞춘다
module.exports = withNativeWind(config, {
  input: './src/global.css',
  inlineRem: 16,
});
