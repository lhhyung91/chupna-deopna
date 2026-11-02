import { useEntrance } from '@/hooks/useEntrance';
import { formatTemp } from '@/lib/format';
import { ENTRANCE } from '@/lib/motion';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type Direction = 'up' | 'down';

// 오르면 새 숫자가 아래에서 올라오고 이전 숫자는 위로 빠진다
const ROLL = {
  hidden: (direction: Direction) => ({
    y: direction === 'up' ? '100%' : '-100%',
  }),
  shown: { y: 0 },
  exit: (direction: Direction) => ({
    y: direction === 'up' ? '-100%' : '100%',
  }),
};

type Props = { value: number; turn: string };

// 탭(turn)이 바뀌었을 때만 굴린다. 같은 탭에서 새 날씨가 오면 숫자만 조용히 바뀐다
export function RollingNumber({ value, turn }: Props) {
  const { animate, timing } = useEntrance();
  const shown = Math.round(value);
  const [roll, setRoll] = useState({
    turn,
    shown,
    key: 0,
    direction: 'up' as Direction,
  });
  if (roll.turn !== turn) {
    setRoll({
      turn,
      shown,
      key: shown === roll.shown ? roll.key : roll.key + 1,
      direction: shown > roll.shown ? 'up' : 'down',
    });
  } else if (roll.shown !== shown) {
    setRoll({ ...roll, shown });
  }

  return (
    // 가로는 자르지 않아야 좁은 자간에 끝 글자가 잘리지 않는다
    <span className="inline-grid h-9 overflow-y-clip">
      <AnimatePresence initial={false} custom={roll.direction}>
        <motion.span
          key={roll.key}
          custom={roll.direction}
          variants={ROLL}
          initial="hidden"
          animate={animate}
          exit="exit"
          transition={timing(ENTRANCE.number)}
          className="col-start-1 row-start-1"
        >
          {formatTemp(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
