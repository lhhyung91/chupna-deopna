import { formatTemp } from '@/lib/format';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useEntrance } from '~/hooks/useEntrance';
import { rollIn, rollOut } from '~/lib/motion';

type Props = {
  value: number;
  // 이 값이 바뀔 때(탭 전환)만 굴린다
  turn: string;
};

// 탭이 바뀌었을 때만 굴린다. 같은 탭에서 새 날씨가 오면 숫자만 조용히 바뀐다(웹 RollingNumber와 같은 규칙)
export function RollingNumber({ value, turn }: Props) {
  const animate = useEntrance();
  const shown = Math.round(value);
  const [roll, setRoll] = useState({ turn, shown, key: 0, up: true });
  if (roll.turn !== turn) {
    setRoll({
      turn,
      shown,
      key: shown === roll.shown ? roll.key : roll.key + 1,
      up: shown > roll.shown,
    });
  } else if (roll.shown !== shown) {
    setRoll({ ...roll, shown });
  }

  return (
    <View className="h-9 overflow-hidden">
      <Animated.View
        key={roll.key}
        entering={animate ? rollIn(roll.up) : undefined}
        exiting={animate ? rollOut(roll.up) : undefined}
      >
        <Text className="font-num-bold text-3xl tabular-nums tracking-[-1.5px] text-ink">
          {formatTemp(value)}
        </Text>
      </Animated.View>
    </View>
  );
}
