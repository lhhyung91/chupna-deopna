import { levelRange, LEVELS } from '@/lib/outfit';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '~/components/Card';
import { ClothingIcon } from '~/components/ClothingIcon';
import { ChevronIcon } from '~/components/Icons';
import { useInk } from '~/lib/theme';

type Props = {
  currentIndex: number;
  offset: number;
  // 옷을 고른 때. 평일 "출근길", 주말 "아침"
  basis: string;
  // 페이지 맨 끝이라 펼친 표가 화면 아래로 숨어서, 펼칠 때 표 쪽으로 화면을 옮긴다
  onOpen: () => void;
};

export function OutfitGuide({ currentIndex, offset, basis, onOpen }: Props) {
  const ink = useInk();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between gap-2 p-5"
      >
        <Text className="font-sans-bold text-base text-ink">
          온도별로 이렇게 입어보세요
        </Text>
        <View className={open ? 'rotate-180' : 'rotate-0'}>
          <ChevronIcon size={20} color={ink} />
        </View>
      </Pressable>
      {/* 닫힌 동안엔 목록을 그리지 않는다. 펼쳐 놓기 전엔 페이지가 짧아 그 자리로 못 가서, 목록이 자리 잡은 뒤 옮긴다 */}
      {open && (
        <View onLayout={onOpen} className="gap-3 px-5 pb-5">
          <View className="gap-1">
            {LEVELS.map((level, i) => {
              const current = i === currentIndex;
              const text = current ? 'text-bg' : 'text-ink';
              return (
                <View
                  key={levelRange(i)}
                  accessible
                  accessibilityState={{ selected: current }}
                  className={`flex-row items-center gap-x-3 rounded-xl border-2 px-3 py-2 ${current ? 'border-ink bg-ink' : 'border-transparent'}`}
                >
                  <Text
                    className={`w-18 font-num-bold text-sm tabular-nums ${text}`}
                  >
                    {levelRange(i)}
                  </Text>
                  <View className="flex-1 gap-1">
                    <View className="flex-row gap-1" accessible={false}>
                      {level.items.map((item) => (
                        <ClothingIcon
                          key={item.label}
                          kind={item.kind}
                          size={32}
                        />
                      ))}
                    </View>
                    <Text
                      lineBreakStrategyIOS="hangul-word"
                      className={`text-sm ${current ? 'font-sans-bold' : 'font-sans'} ${text}`}
                    >
                      {level.items.map((item) => item.label).join(' + ')}
                    </Text>
                    {level.tip && (
                      <Text
                        lineBreakStrategyIOS="hangul-word"
                        className={`font-sans text-xs ${current ? 'text-bg' : 'text-muted'}`}
                      >
                        {level.tip}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          <Text className="font-sans text-xs text-muted">
            {basis}에 느끼는 온도로 골라요
            {offset > 0 && `. 추위를 타는 편이라 ${offset}° 따뜻하게 골라요`}
            {offset < 0 && `. 더위를 타는 편이라 ${-offset}° 가볍게 골라요`}
          </Text>
        </View>
      )}
    </Card>
  );
}
