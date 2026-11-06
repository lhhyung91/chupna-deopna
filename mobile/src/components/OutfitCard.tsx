import type { OutfitLevel } from '@/lib/outfit';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Card, Tactile } from '~/components/Card';
import { ClothingIcon } from '~/components/ClothingIcon';
import { RefreshIcon } from '~/components/Icons';
import { WeatherIcon } from '~/components/WeatherIcon';
import { useEntrance } from '~/hooks/useEntrance';
import { useOutfitPicks } from '~/hooks/useOutfitPicks';
import { ICON_POP } from '~/lib/motion';
import { useInk } from '~/lib/theme';

type Props = {
  title: string;
  // "출근길 체감 6° 기준"에서 숫자만 굵게 쓰려고 나눠 받는다
  basisLabel: string;
  basisTemp: string;
  level: OutfitLevel;
  umbrella: boolean;
};

// 새로 붙는 그림만 커지며 나온다. 탭을 넘기거나 ↻로 옷이 바뀐 칸만 키(옷 이름)가 바뀌어 다시 붙는다
function Pop({ children }: { children: ReactNode }) {
  return (
    <Animated.View entering={useEntrance() ? ICON_POP : undefined}>
      {children}
    </Animated.View>
  );
}

export function OutfitCard({
  title,
  basisLabel,
  basisTemp,
  level,
  umbrella,
}: Props) {
  const ink = useInk();
  const { choose, next } = useOutfitPicks();
  const items = choose(level);
  // 우산까지 4칸이면 375pt 한 줄에 들어가게 칸과 그림을 줄인다
  const wide = items.length + (umbrella ? 1 : 0) > 3;
  const tile = `w-full items-center justify-center rounded-2xl border-2 border-ink ${wide ? 'h-19' : 'h-23'}`;
  const combo = [
    ...items.map((item) => item.label),
    ...(umbrella ? ['우산'] : []),
  ];

  return (
    <Card className="gap-4 p-5">
      <View className="flex-row items-center justify-between gap-3">
        {/* 기준 숫자는 요약 카드의 출근 숫자와 같아서, 여기선 어느 숫자로 골랐는지만 작게 알린다 */}
        <View className="min-w-0 items-start gap-1.5">
          <View className="rounded-lg bg-ink px-2.5 py-0.5">
            <Text
              accessibilityRole="header"
              className="font-display text-base/5.5 text-bg"
            >
              {title}
            </Text>
          </View>
          <Text className="font-sans-bold text-xs text-muted">
            {basisLabel} <Text className="text-ink">{basisTemp}</Text> 기준
          </Text>
        </View>
        {level.alternatives && (
          <Tactile
            onPress={() => next(level)}
            rounded="rounded-2xl"
            accessibilityLabel="다른 옷 조합 보기"
            className="size-11 items-center justify-center bg-card"
          >
            <RefreshIcon size={22} color={ink} />
          </Tactile>
        )}
      </View>
      {/* 그림 아래 이름이 보이니 스크린리더엔 조합 한 문장만 읽힌다 */}
      <View
        accessible
        accessibilityLabel={`추천 옷차림: ${combo.join(' + ')}`}
        className={`flex-row ${wide ? 'gap-2' : 'gap-3'}`}
      >
        {items.map((item, index) => (
          <View key={index} className="flex-1 items-center gap-1.5">
            <View className={`${tile} bg-well`}>
              <Pop key={item.kind}>
                <ClothingIcon kind={item.kind} size={wide ? 56 : 76} />
              </Pop>
            </View>
            <Text className="font-sans-bold text-[0.8125rem]/4.5 text-ink">
              {item.label}
            </Text>
          </View>
        ))}
        {/* 입는 옷이 아니라 챙길 물건이라 점선 칸으로 구분한다 */}
        {umbrella && (
          <View className="flex-1 items-center gap-1.5">
            <View className={`${tile} border-dashed bg-acc-tile`}>
              <Pop>
                <WeatherIcon kind="umbrella" size={56} />
              </Pop>
            </View>
            <Text className="font-sans-black text-[0.8125rem]/4.5 text-ink">
              + 우산
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
