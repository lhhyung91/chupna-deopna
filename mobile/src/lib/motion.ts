import { ENTRANCE, SWAP_POP } from '@/lib/motion';
import { Easing, Keyframe } from 'react-native-reanimated';

// 웹 motion 값(초, 베지어 배열)을 그대로 가져와 Reanimated 단위(ms, Easing)로 바꾼다. 숫자는 웹 한 곳에만 둔다
type Timing = { duration?: number; delay?: number; ease?: unknown };

const ms = (seconds = 0) => Math.round(seconds * 1000);

function easing({ ease }: Timing) {
  if (Array.isArray(ease) && ease.length === 4) {
    const [x1, y1, x2, y2] = ease.map(Number);
    return Easing.bezier(x1, y1, x2, y2);
  }
  return Easing.out(Easing.quad);
}

const timed = (frames: ConstructorParameters<typeof Keyframe>[0], t: Timing) =>
  new Keyframe(frames).duration(ms(t.duration)).delay(ms(t.delay));

const fadeIn = (t: Timing) =>
  timed({ 0: { opacity: 0 }, 100: { opacity: 1, easing: easing(t) } }, t);

// 요약 첫 줄·시간대별: 면적이 커서 툭 바뀌는 게 보여 지연 없이 흐려졌다 나타난다
export const SOFT_FADE = fadeIn(ENTRANCE.soft);
// 한마디·아침 비교 문구
export const TEXT_FADE = fadeIn(ENTRANCE.fade);

export const LINE_DRAW = timed(
  {
    0: { transform: [{ scaleX: 0 }] },
    100: { transform: [{ scaleX: 1 }], easing: easing(ENTRANCE.line) },
  },
  ENTRANCE.line
);

// 선이 끝에 거의 닿을 때 왼쪽 8에서 제자리로 나타난다
export const ARROW_IN = timed(
  {
    0: { opacity: 0, transform: [{ translateX: -8 }] },
    75: { opacity: 0, transform: [{ translateX: -8 }] },
    100: {
      opacity: 1,
      transform: [{ translateX: 0 }],
      easing: easing(ENTRANCE.arrow),
    },
  },
  ENTRANCE.arrow
);

export const BADGE_POP = timed(
  {
    0: { opacity: 0, transform: [{ scale: 0.4 }] },
    60: {
      opacity: 1,
      transform: [{ scale: 1.14 }],
      easing: easing(ENTRANCE.badge),
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }],
      easing: easing(ENTRANCE.badge),
    },
  },
  ENTRANCE.badge
);

// 옷이 바뀐 칸의 그림만. 투명에서 시작하면 그 사이 칸이 비어 보여 크기만 키운다
export const ICON_POP = timed(
  {
    0: { transform: [{ scale: 0.8 }] },
    100: { transform: [{ scale: 1 }], easing: easing(SWAP_POP) },
  },
  SWAP_POP
);

// 출퇴근 숫자 칸 높이(h-9). 오르면 아래에서 올라오고 이전 숫자는 위로 빠진다
const ROLL_DISTANCE = 36;

export const rollIn = (up: boolean) =>
  timed(
    {
      0: { transform: [{ translateY: up ? ROLL_DISTANCE : -ROLL_DISTANCE }] },
      100: { transform: [{ translateY: 0 }], easing: easing(ENTRANCE.number) },
    },
    ENTRANCE.number
  );

// 빠지는 숫자가 더 넓으면 옆 아이콘에 겹칠 수 있어 흐려지며 빠진다
export const rollOut = (up: boolean) =>
  timed(
    {
      0: { opacity: 1, transform: [{ translateY: 0 }] },
      100: {
        opacity: 0,
        transform: [{ translateY: up ? -ROLL_DISTANCE : ROLL_DISTANCE }],
        easing: easing(ENTRANCE.number),
      },
    },
    ENTRANCE.number
  );

// 고른 피드백 버튼·몽실이. 웹 globals.css의 pop·bounce3d 키프레임과 같은 값이다
const SPRING = Easing.bezier(0.34, 1.56, 0.64, 1);
export const PICK_POP = new Keyframe({
  0: { transform: [{ scale: 0.92 }] },
  55: { transform: [{ scale: 1.05 }], easing: SPRING },
  100: { transform: [{ scale: 1 }], easing: SPRING },
}).duration(380);
export const PICK_BOUNCE = new Keyframe({
  0: { transform: [{ translateY: 0 }, { scale: 1 }] },
  35: { transform: [{ translateY: -7 }, { scale: 1.14 }], easing: SPRING },
  70: { transform: [{ translateY: 1 }, { scale: 0.96 }], easing: SPRING },
  100: { transform: [{ translateY: 0 }, { scale: 1 }], easing: SPRING },
}).duration(550);
