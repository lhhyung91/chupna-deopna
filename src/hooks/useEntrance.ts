import { useSplashRevealed } from '@/components/SplashGate';
import { type Transition, useReducedMotion } from 'motion/react';

// 처음 뜰 때와 탭을 바꿀 때 나오는 움직임. 탭마다 key를 바꿔 다시 붙이면 처음부터 재생된다
export function useEntrance() {
  const revealed = useSplashRevealed();
  // MotionConfig의 reducedMotion은 이동만 끄고 페이드는 남겨서, 동작 줄이기면 시간을 0으로 둔다
  const reduce = useReducedMotion();
  return {
    animate: revealed ? 'shown' : 'hidden',
    timing: (transition: Transition): Transition =>
      reduce ? { duration: 0 } : transition,
  };
}
