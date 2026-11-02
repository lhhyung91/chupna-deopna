import type { Transition } from 'motion/react';

const POP = [0.34, 1.56, 0.64, 1] as const;

// 탭을 누른 순간을 0으로 숫자·비교선 → 배지 → 옷 타일 순서로 1초 안에 끝난다(HANDOFF_MOTION)
export const ENTRANCE = {
  number: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] },
  line: { duration: 0.42, ease: [0.3, 0.7, 0.2, 1] },
  arrow: { duration: 0.42, ease: 'easeOut', times: [0, 0.75, 1] },
  badge: { duration: 0.36, delay: 0.34, ease: POP, times: [0, 0.6, 1] },
  fade: { duration: 0.25, delay: 0.2, ease: 'easeOut' },
} satisfies Record<string, Transition>;

export const tileEntrance = (index: number): Transition => ({
  duration: 0.42,
  delay: 0.45 + index * 0.06,
  ease: POP,
});
