import type { Transition } from 'motion/react';

const POP = [0.34, 1.56, 0.64, 1] as const;

// 탭을 누른 순간을 0으로 숫자·비교선 → 배지 → 옷 타일 순서로 1초 안에 끝난다(HANDOFF_MOTION)
export const ENTRANCE = {
  number: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] },
  line: { duration: 0.42, ease: [0.3, 0.7, 0.2, 1] },
  arrow: { duration: 0.42, ease: 'easeOut', times: [0, 0.75, 1] },
  badge: { duration: 0.36, delay: 0.34, ease: POP, times: [0, 0.6, 1] },
  fade: { duration: 0.25, delay: 0.2, ease: 'easeOut' },
  // 핸드오프에 없지만 면적이 커서 탭이 바뀔 때 툭 바뀌는 게 보이는 칸(요약 첫 줄·시간대별). 지연 없이 흐려졌다 나타난다
  soft: { duration: 0.25, ease: 'easeOut' },
} satisfies Record<string, Transition>;

export const FADE = { hidden: { opacity: 0 }, shown: { opacity: 1 } };

// 옷 타일을 눌러 다른 옷으로 바꿀 때 그림만 짧게 팝한다
export const SWAP_POP: Transition = { duration: 0.3, ease: POP };

export const tileEntrance = (index: number): Transition => ({
  duration: 0.42,
  delay: 0.45 + index * 0.06,
  ease: POP,
});
