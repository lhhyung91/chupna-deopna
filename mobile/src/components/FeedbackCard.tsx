import type { Feeling } from '@/lib/feedback';
import { Pressable, Text, View } from 'react-native';
import { Card, Raised } from '~/components/Card';
import { CheckIcon } from '~/components/Icons';
import { WeatherIcon } from '~/components/WeatherIcon';
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
          // 이동(translate)은 두 상태 모두 둔다. 처음 없던 transform이 생기면 NativeWind가 컴포넌트를 바꿔 끼우다 오류가 난다
          return (
            <Raised
              key={id}
              depth={3}
              rounded="rounded-2xl"
              flat={pressed}
              className="flex-1"
            >
              <Pressable
                onPress={() => onSelect(id)}
                accessibilityRole="button"
                accessibilityState={{ selected: pressed }}
                className={`h-22 items-center justify-center gap-1 rounded-2xl border-2 border-ink ${pressed ? 'translate-x-[3px] translate-y-[3px] bg-point' : 'translate-x-0 translate-y-0 bg-card'}`}
              >
                {/* 몽실이는 가로로 넓은 구름이라 44에선 표정이 작아서 키운다 */}
                <WeatherIcon kind={id} size={56} />
                <Text
                  className={`font-sans-bold text-sm ${pressed ? 'text-on-bright' : 'text-ink'}`}
                >
                  {label}
                </Text>
              </Pressable>
            </Raised>
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
