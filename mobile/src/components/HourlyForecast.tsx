import { formatTemp } from '@/lib/format';
import type { HourlyItem } from '@/lib/weather';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '~/components/Card';
import { WeatherIcon } from '~/components/WeatherIcon';

// 칸 폭(w-14) + 간격(gap-2). 넘길 때 칸 단위로 멈추게 한다
const SNAP = 56 + 8;

export function HourlyForecast({
  hourly,
  highlightFirst,
}: {
  hourly: HourlyItem[];
  highlightFirst: boolean;
}) {
  return (
    <Card className="gap-3 pb-3 pt-5">
      <Text
        accessibilityRole="header"
        className="px-5 font-sans-bold text-base text-ink"
      >
        시간대별
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerClassName="gap-2 px-5 pt-1 pb-2"
      >
        {hourly.map((h, i) => {
          const isNow = i === 0 && highlightFirst;
          // "지금" 칸은 바탕이 반전되므로 글자도 반전색으로
          const text = isNow ? 'text-bg' : 'text-ink';
          return (
            <View
              key={h.label}
              accessible
              accessibilityLabel={`${h.label} ${formatTemp(h.temp)}, 비 ${h.pop}%`}
              className={`h-28 w-14 items-center justify-center gap-1 rounded-2xl ${isNow ? 'border-2 border-ink bg-ink' : ''}`}
            >
              <Text
                className={`text-xs ${isNow ? 'font-sans-bold' : 'font-sans-medium'} ${text}`}
              >
                {h.label}
              </Text>
              <WeatherIcon kind={h.sky} size={32} />
              <Text className={`font-num-bold text-base tabular-nums ${text}`}>
                {formatTemp(h.temp)}
              </Text>
              <Text
                className={`font-sans text-xs tabular-nums ${isNow ? 'text-bg' : h.pop > 0 ? 'text-pop' : 'text-muted'}`}
              >
                {h.pop}%
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Card>
  );
}
