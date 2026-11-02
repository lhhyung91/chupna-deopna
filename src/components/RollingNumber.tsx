import { useEntrance } from '@/hooks/useEntrance';
import { formatTemp } from '@/lib/format';
import { ENTRANCE } from '@/lib/motion';
import {
  AnimatePresence,
  motion,
  type Transition,
  useIsPresent,
} from 'motion/react';
import { useState } from 'react';

type Direction = 'up' | 'down';

// 오르면 새 숫자가 아래에서 올라오고 이전 숫자는 위로 빠진다. 빠지는 숫자가 더 넓으면 옆 아이콘에 겹칠 수 있어 흐려지며 빠진다
const ROLL = {
  hidden: (direction: Direction) => ({
    y: direction === 'up' ? '100%' : '-100%',
  }),
  shown: { y: 0, opacity: 1 },
  exit: (direction: Direction) => ({
    y: direction === 'up' ? '-100%' : '100%',
    opacity: 0,
  }),
};

type Align = 'start' | 'end';

type Props = {
  value: number;
  turn: string;
  // 오른쪽 정렬 칸(퇴근)은 end
  align: Align;
};

type FaceProps = {
  text: string;
  direction: Direction;
  align: Align;
  animate: string;
  transition: Transition;
};

// 빠지는 숫자는 칸에서 바로 빼서(absolute) 칸 끝에 붙인다. 겹쳐 두면 칸이 넓은 숫자에 맞춰졌다가 빠진 뒤 줄면서 오른쪽 정렬 칸이 튄다
function Face({ text, direction, align, animate, transition }: FaceProps) {
  const isPresent = useIsPresent();
  return (
    <motion.span
      custom={direction}
      variants={ROLL}
      initial="hidden"
      animate={animate}
      exit="exit"
      transition={transition}
      className={
        isPresent
          ? 'block'
          : `absolute top-0 ${align === 'end' ? 'right-0' : 'left-0'}`
      }
    >
      {text}
    </motion.span>
  );
}

// 탭(turn)이 바뀌었을 때만 굴린다. 같은 탭에서 새 날씨가 오면 숫자만 조용히 바뀐다
export function RollingNumber({ value, turn, align }: Props) {
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
    <span className="relative inline-block h-9 overflow-y-clip whitespace-nowrap">
      <AnimatePresence initial={false} custom={roll.direction}>
        <Face
          key={roll.key}
          text={formatTemp(value)}
          direction={roll.direction}
          align={align}
          animate={animate}
          transition={timing(ENTRANCE.number)}
        />
      </AnimatePresence>
    </span>
  );
}
