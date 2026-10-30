@AGENTS.md

# 춥나덥나 (chupna-deopna)

출근길 체감온도로 오늘·내일 입을 옷을 3초 안에 알려주는 개인용 날씨 PWA. 동네 이름을 누르면 폰 위치(GPS)로 바뀌고, 위치를 모르면 서울 중구(`DEFAULT_PLACE`)를 쓴다.

- 배포: Vercel, `main` 브랜치 → https://chupna-deopna.vercel.app
- 스택: Next.js 16(App Router, cacheComponents), React 19, TypeScript strict, Tailwind v4(설정 파일 없이 `globals.css`의 `@theme`), motion
- 기획·로직(옷차림 기준, 문구)은 이 저장소의 결정이 기준이다. 디자인 시안과 로직이 다르면 디자인만 반영한다.

## 작업 규칙

- **모든 답변은 한국어**로 한다. 진행 상황 한 줄, 요약, 질문, 버튼 문구까지 전부. 코드·명령어·파일명만 원문 그대로 둔다.
- **브랜치**
  - 작업은 항상 `git fetch origin` → `git switch -c <type>/<이름> origin/dev` → `git branch --unset-upstream`으로 시작한다.
  - 작업 브랜치는 GitHub에 올리지 않는다.
  - 사용자가 로컬에서 dev에 합쳐 `dev`만 push하고, 배포할 때 dev를 main에 합친다.
- **git add/commit/merge/push는 사용자가 직접** 한다. Claude는 파일만 고치고 명령어 초안을 준다.
  - 커밋 단위마다 코드 블록 하나: `git add <파일들> && git commit -m "<type>: 한글 제목"`
  - 제목 한 줄만 쓴다. 본문·트레일러(Co-Authored-By 등)는 넣지 않는다.
  - 마지막에 `git switch dev && git merge <브랜치> && git push origin dev && git branch -d <브랜치>`를 준다.
- **완료 보고 전 검사**: `npm run format`, `npm run lint`, `npm run lint:tw`(Tailwind 정식 표기, 0종류여야 함), `npm run build`
- **Tailwind는 정식 표기**로 쓴다.
  - `h-[88px]` 대신 `h-22`, `text-base leading-[22px]` 대신 `text-base/5.5`, `w-14 h-14` 대신 `size-14`
  - 임의 값은 스케일에 없을 때만 쓴다.
- 인라인 `style` 금지, 모바일(320·375px)부터 생각한다. 주석은 한국어 한 줄로 "왜"만 쓴다.
- 화면 확인은 사용자가 띄워 둔 `localhost:3000` dev 서버로 한다. 3100 등 다른 서버를 따로 띄우지 않는다.
  - 먼저 `lsof -iTCP:3000 -sTCP:LISTEN`으로 3000이 떠 있는지 본다. 꺼져 있을 때만 다른 방법을 쓴다.
  - 3000의 CSS가 낡아 보이면(Turbopack 캐시) 사용자에게 `rm -rf .next` 후 dev 서버 재시작을 제안한다.
  - `npm run build`는 검사 단계에서 계속 돌린다. 빌드 뒤 3000 화면이 깨지면 사용자에게 알린다.
- **작업 단위가 끝나면 노션 기록을 먼저 제안**한다.
  - 기록 위치: 노션 "작업 내역" > [chupna-deopna (춥나덥나)](https://app.notion.com/p/40792c61ae85814f81cfe1b97725b77a)
  - 형식: `## MM-DD — 제목` / `> 결과 한 줄` / 요청·진행·커밋 / `<toggle>자세히</toggle>`, 최신이 위
  - 사용자가 동의하면 초안 확인 없이 바로 올린다.

## 구조 메모

- `src/lib/weather.ts`: 기상청 단기예보. 02시 발표분과 최신 발표분을 합쳐 오늘·내일을 만든다. KST는 Date를 +9h 밀어 `getUTC*`로 읽는다.
- `src/lib/weather.ts`의 `now`는 초단기실황(관측값). 실패하면 이번 시각 예보로 대신한다.
- 위치
  - `src/lib/location.ts`: 위경도 → 기상청 격자(`latLonToGrid`), 쿠키 `place`(이름·nx·ny)
  - `src/lib/kakao.ts`: 좌표 → "서울 중구" (카카오 로컬 `coord2regioncode`)
  - `src/app/actions.ts`의 `updatePlace`가 쿠키를 바꾸면 화면이 새 동네로 다시 그려진다.
  - `src/hooks/useLocate.ts`: 위치 찾기. 권한이 이미 허용돼 있으면 열 때마다 조용히 따라간다. 새 동네 예보가 올 때까지(`useTransition`) 이름 자리에 "위치 찾는 중"·점, 내용은 흐리게
  - `src/components/PlaceHeading.tsx`: 이름 버튼. 쿠키에 동네가 없으면(처음 방문) "이름을 누르면 지금 위치로 바뀌어요"
- 로딩 화면(`SplashScreen`): 루트 레이아웃의 `SplashProvider`(`SplashGate.tsx`)가 한 번만 그린다. 서버를 기다리다 날씨가 와도 같은 요소라 다시 깜빡이지 않는다. 페이지가 `useSplashHold`로 알리면 걷는다. 마지막으로 다 보여준 지 3시간(단기예보 발표 간격)이 지났을 때만 최소 2초·위치 확인까지(최대 3초) 덮고, 그 안에 다시 열면 그려지는 대로 바로 걷는다(localStorage `splash-shown-at`). 0.5초 페이드.
- 다시 열기: `public/sw.js`가 첫 화면(`/`)을 저장해 두고, 3시간 안에 다시 열면 서버를 기다리지 않고 저장본을 바로 띄운 뒤 뒤에서 새로 받아 저장한다. `/_next/static/*`도 저장해 배포 뒤에도 옛 화면이 열린다. 이때 `layout.tsx` 첫 그림 전 스크립트가 로딩 화면을 숨기고(`data-splash="skip"`), `WeatherView`는 그린 지 1분 넘은 화면이면 `router.refresh()`로 새 날씨를 받는다. 서비스 워커는 배포본에서만 등록한다(dev에선 저장된 화면 때문에 고친 코드가 안 보여서). Claude 앱 브라우저는 서비스 워커가 막혀 있어 확인은 설치된 크롬으로 한다 첫 장면부터 이름·문구가 다 보인다. 문구는 "날씨 가져오는 중…" 하나
- 화면 순서: 헤더 → 요약(`SummaryCard`) → 옷차림(비·눈이면 `+ 우산` 칸) → 시간대별 → 피드백 → 온도별 옷차림 표
  - 요약: 지금 기온·하늘과 아래 "어제보다 ▼8°"(내일 탭은 오늘과, 출근 체감 기준) / 출근 → 퇴근 체감과 차이 배지(글자 없이 숫자·색만) / 두 줄 한마디
  - 저녁(18시~) 오늘 탭: 피드백이 맨 위, 요약은 오늘 하루 정리(과거형), 옷 제목은 "오늘 추천했던 옷"
- `src/lib/outfit.ts`
  - `LEVELS`: 출근길 체감 기준 10단계. 흔한 기온별 표보다 경계를 3° 낮춰 둠.
  - `getTake`: 요약 두 줄 한마디. 눈 > 비 > 강풍 > 일교차 중 하나만, 없으면 퇴근길 안내(`getEveningTip`). 각 줄은 칸 안 한 줄에 들어가게 쓴다
  - `getCommuteDelta`: 출근 → 퇴근 체감 차이와 문구. `isRainy`(60% 이상 또는 하늘이 비)가 우산·비 표시 기준
  - `getBanners`: 저녁 알림 문구에만 쓴다
- `src/lib/mornings.ts`: 쿠키 `mornings`에 오늘·어제 출근 체감을 남긴다. 예보 API가 지난날 값을 다시 주지 않아서다
- `src/hooks/useFeedback.ts`: 춥다/덥다 피드백을 localStorage에 14일 저장해 ±3°(`MAX_OFFSET`) 보정. 오늘 누른 건 오늘 추천은 그대로 두고 내일 탭·알림(`nextOffset`)부터 반영
- 저녁 알림 (웹 푸시)
  - `src/lib/alert.ts`: 문구. 내일 비·눈이 오거나 출근길 체감이 오늘과 5° 이상 다를 때만 보낸다.
  - `src/lib/pushStore.ts`: Upstash Redis에 구독과 보정값을 저장
  - `src/app/actions.ts`: Server Actions
  - `src/app/api/cron/evening-alert/route.ts`: 크론이 부르는 경로
  - `public/sw.js`: 서비스 워커. 알림을 누르면 `/?day=tomorrow`로 열린다.
  - `src/components/AlertButton.tsx`: 헤더 종 아이콘과 설정 팝업(`<dialog>`)

## 특이사항

- **환경 변수**
  - 목록은 `.env.example`에 있다. 실제 값은 `.env.local`(git 제외)에만 둔다. `.env.example`에 실제 값을 넣지 않는다.
  - `KMA_SERVICE_KEY`: 공공데이터포털 마이페이지에서 다시 복사할 수 있다.
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`·`VAPID_PRIVATE_KEY`
    - Vercel에서 공개키는 Config, 개인키는 Sensitive로 등록돼 있다.
    - **새로 만들면 기존 알림 구독이 모두 끊기니** 원래 컴퓨터의 `.env.local`에서 옮겨온다.
  - `CRON_SECRET`: Sensitive라 Vercel에서 다시 볼 수 없다. 원래 `.env.local`에서 옮기거나, 새로 만들어 Vercel 값도 같이 바꾼다.
  - `KAKAO_REST_API_KEY`: developers.kakao.com 앱의 REST API 키. 앱에서 카카오맵 사용 설정을 켜야 한다. 없으면 이름만 "현재 위치"로 나온다.
  - `KV_REST_API_URL`·`KV_REST_API_TOKEN`
    - Vercel Storage의 Upstash Redis에서 복사한다. READ_ONLY 토큰은 안 된다.
    - 이 Redis는 다른 프로젝트와 같이 쓰므로 키에 `chupna-deopna:` 접두사를 붙인다.
- **크론**
  - `vercel.json`의 `0 11 * * *`(UTC)가 한국 시각 20시대다. 무료 플랜이라 20:00~20:59 사이 아무 때나 실행된다.
  - 수신 테스트는 프로젝트 폴더에서 이 명령으로 한다. 조건과 상관없이 보낸다.
    ```bash
    curl -H "Authorization: Bearer $(grep ^CRON_SECRET= .env.local | cut -d= -f2-)" "https://chupna-deopna.vercel.app/api/cron/evening-alert?force=1"
    ```
- 아이폰 웹 푸시는 **홈 화면에 추가한 앱에서만** 된다. Claude 앱 안의 브라우저는 서비스 워커와 알림이 막혀 있어 로컬에서 수신을 확인할 수 없다.
- iOS 시작 화면: `public/splash/logo_splash_<가로>x<세로>_{dark,light}.png` 22장
  - 실제 로딩 화면을 기기 크기별로 찍은 그림이다. 앱이 뜨기 전부터 로딩 화면이 보이고, 넘어갈 때 같은 화면이라 끊기지 않는다.
  - 크기 표·상태 표시줄 높이는 `src/lib/splash-sizes.json`. 웹 화면은 상태 표시줄 아래에서 시작해서 그만큼 내려 붙인다.
  - 로딩 화면을 바꾸면 3000 dev 서버를 켠 채 `node scripts/make_splash.mjs`로 다시 찍는다(설치된 크롬을 씀).
  - iOS는 홈 화면에 추가할 때 시작 그림을 읽는다. 바꾼 뒤엔 앱을 지웠다 다시 추가해야 보일 수 있다(알림 다시 켜기, 피드백 기록 초기화).
- 공유 미리보기는 `src/app/opengraph-image.jpg`다. 카톡은 미리보기를 캐시하니 바꾼 뒤 카카오 공유 디버거에서 캐시를 지운다.
- 아이콘은 `public/icons/icon_<형태>_{light,dark}.png`다. 이름은 의미가 아니라 형태 기준이다.

## 진행 상황 (2026-10-29 기준)

- 끝남
  - 출근길 기준 옷차림, 퇴근 안내, motion 전환
  - OG 이미지
  - 저녁 알림. 설정은 헤더 종 아이콘 팝업에 있다.
  - 지금 날씨 카드, 현재 위치 기반 예보
- 남은 것
  - 아이폰에서 위치 잡기 확인. 이름 누르기 → 허용 → 동네·예보 변경
  - 아이폰 위젯(Scriptable): 아직 시작 전
    - `src/app/api/widget/route.ts`(GET, `?offset=n`): 퇴근 시간 전엔 오늘, 후엔 내일 옷차림을 JSON으로 준다.
    - `scripts/scriptable_widget.js`: 붙여넣을 위젯 스크립트. 소형·중형, Parameter 칸에 보정값을 넣는다.
