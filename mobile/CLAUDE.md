@AGENTS.md

# 춥나덥나 아이폰 앱 (mobile)

웹(루트 Next 앱)과 같은 서버·로직을 쓰는 아이폰 전용 Expo 앱. 지금은 뼈대만 있다. 규칙은 루트 `CLAUDE.md`를 그대로 따른다.

- 스택: Expo SDK 58(React Native 0.88), expo-router(`src/app`), NativeWind 4.2.7 + Tailwind 3.4, Reanimated 4.7
  - NativeWind 5는 아직 RC라 쓰지 않았다. Tailwind가 웹(v4)과 버전이 달라 설정도 따로다(`tailwind.config.js`, `src/global.css`)
  - 무료 개발자 계정이라 Expo Go로만 돌린다. Expo Go에 없는 네이티브 모듈은 넣지 않는다. 앱스토어 Expo Go는 최신 SDK 하나만 받는다
- 실행: `npx expo start` → 아이폰 카메라로 QR. 아이폰 Expo Go는 CLI(`npx expo login`)와 앱 양쪽에 같은 Expo 계정으로 로그인해야 열린다
- 검사: `npm run typecheck`, `npm run format`, `npx expo-doctor`
- 별칭
  - `@/…` → 루트 `src/…`. 웹과 같이 쓰는 로직(`@/lib/outfit` 등). 루트 파일끼리 `@/lib/…`로 부르므로 이 이름을 바꾸지 않는다
  - `~/…` → `mobile/src/…`, `~/assets/…` → `mobile/assets/…`
  - Metro는 `watchFolders`로 루트 `src`만 더 본다. 공유 파일에서 npm 패키지를 import하면 루트 `node_modules`를 찾다가 번들이 깨지니, 공유 로직은 패키지 없이 순수 TS로 둔다
  - 루트 `src/lib/weather.ts`의 Next 전용 `fetch` 옵션 타입은 `next-fetch-env.d.ts`가 채운다
- 색: `src/global.css`에 웹 `globals.css`의 라이트·다크 값을 옮겨 두었다(시스템 설정을 따름). 웹 색을 바꾸면 같이 바꾼다. 그림자·반투명 값(`--hi`·`--lo`·`--ground` 등)은 아직 안 옮겼다
- 크기: `inlineRem: 16`으로 1rem = 16pt. 웹과 같은 클래스가 같은 크기다
- 글꼴: 굵기마다 이름이 달라 `font-bold` 대신 `font-sans-bold`·`font-display`·`font-num` 등을 쓴다(`tailwind.config.js`). 한글 글꼴이 굵기마다 6MB라 처음 열 때 조금 걸린다
- 에셋: 웹 `public/icons`·`public/splash/cloud-*`·`src/app/texture_noise.png`의 복사본. 웹에서 바꾸면 여기도 다시 복사한다. 옷 그림은 `src/lib/clothingIcons.ts`(라이트·다크)
