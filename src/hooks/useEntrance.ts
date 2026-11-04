import { useSplashRevealed } from '@/components/SplashGate';
import { type Transition, useReducedMotion } from 'motion/react';

// 탭을 바꿀 때 나오는 움직임. 탭마다 key를 바꿔 다시 붙이면 처음부터 재생된다
export function useEntrance() {
  const revealed = useSplashRevealed();
  // MotionConfig의 reducedMotion은 이동만 끄고 페이드는 남겨서, 동작 줄이기면 시간을 0으로 둔다
  const reduce = useReducedMotion();
  return {
    // 로딩 화면 뒤에서 처음 그려지는 내용은 이미 다 보이게 둔다. 걷힐 때 하나씩 나타나면 로딩이 덜 끝난 것처럼 보였다
    initial: revealed ? ('hidden' as const) : false,
    timing: (transition: Transition): Transition =>
      reduce ? { duration: 0 } : transition,
  };
}
