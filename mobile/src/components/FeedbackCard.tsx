import type { Feeling } from '@/lib/feedback';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Card, Tactile } from '~/components/Card';
import { CheckIcon } from '~/components/Icons';
import { WeatherIcon } from '~/components/WeatherIcon';
import { useEntrance } from '~/hooks/useEntrance';
import { PICK_BOUNCE, PICK_POP } from '~/lib/motion';
import { useInk } from '~/lib/theme';

const OPTIONS: { id: Feeling; label: string }[] = [
  { id: 'hot', label: '더웠어요' },
  { id: 'good', label: '괜찮았어요' },
  { id: 'cold', label: '추웠어요' },
];

type Props = {
  feeling: Feeling | null;
  offset: number;
  onSelect: (feeling: Feeling) => void;
};

export function FeedbackCard({ feeling, offset, onSelect }: Props) {
  const ink = useInk();
  const animate = useEntrance();
  return (
    <Card className="gap-4 p-5">
      <Text
        accessibilityRole="header"
        className="font-sans-bold text-lg text-ink"
      >
        오늘 옷차림 어땠어요?
      </Text>
      <View className="flex-row gap-3">
        {OPTIONS.map(({ id, label }) => {
          const pressed = feeling === id;
          // 선택은 색과 위치를 함께 바꾼다: 살구색 + 3px 눌림(각진 그림자가 사라짐)
          return (
            // 고르면 버튼이 한 번 통통 튄다(웹 pop). 고를 때만 다시 붙도록 키에 선택 여부를 넣는다
            <Animated.View
              key={`${id}-${pressed}`}
              entering={pressed && animate ? PICK_POP : undefined}
              className="flex-1"
            >
              <Tactile
                onPress={() => onSelect(id)}
                rounded="rounded-2xl"
                down={pressed}
                accessibilityState={{ selected: pressed }}
                className={`h-22 items-center justify-center gap-1 ${pressed ? 'bg-point' : 'bg-card'}`}
              >
                {/* 키를 바꿔야 다시 고를 때도 튀어 오르는 움직임이 처음부터 재생된다 */}
                <Animated.View
                  key={pressed ? 'on' : 'off'}
                  entering={pressed && animate ? PICK_BOUNCE : undefined}
                >
                  {/* 몽실이는 가로로 넓은 구름이라 44에선 표정이 작아서 키운다 */}
                  <WeatherIcon kind={id} size={56} />
                </Animated.View>
                <Text
                  className={`font-sans-bold text-sm ${pressed ? 'text-on-bright' : 'text-ink'}`}
                >
                  {label}
                </Text>
              </Tactile>
            </Animated.View>
          );
        })}
      </View>
      <View accessibilityLiveRegion="polite">
        {feeling ? (
          <View className="flex-row items-center gap-1">
            <CheckIcon size={14} color={ink} />
            <Text className="font-sans text-xs text-muted">
              기록했어요. 다른 버튼을 누르면 바뀌어요
            </Text>
          </View>
        ) : (
          <Text className="font-sans text-xs text-muted">
            내일 옷 고를 때 반영해요
          </Text>
        )}
        {offset !== 0 && (
          <Text className="font-sans text-xs text-muted">
            {offset > 0
              ? `추위를 타는 편이라 ${offset}° 따뜻하게 골라요`
              : `더위를 타는 편이라 ${-offset}° 가볍게 골라요`}
          </Text>
        )}
      </View>
    </Card>
  );
}
