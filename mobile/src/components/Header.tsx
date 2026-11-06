import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cubicBezier,
  useReducedMotion,
} from 'react-native-reanimated';
import { PinIcon } from '~/components/Icons';
import type { Locate, LocateError } from '~/hooks/useLocate';
import { haptic } from '~/lib/haptic';
import { useInk } from '~/lib/theme';

export type Tab = 'today' | 'tomorrow';

const MESSAGES: Record<LocateError, string> = {
  denied: '위치 권한이 꺼져 있어요. 설정에서 이 앱의 위치를 켜주세요',
  failed: '위치를 못 잡았어요. 잠시 후 다시 눌러주세요',
  outside: '기상청 예보는 국내 위치만 볼 수 있어요',
};

// 웹 splash-dot: 셋이 차례로 진해졌다 흐려지며 멈춘 게 아니라는 걸 보여준다
const DOT_PULSE = {
  '0%': { opacity: 0.25, transform: [{ scale: 0.8 }] },
  '40%': { opacity: 1, transform: [{ scale: 1 }] },
  '80%': { opacity: 0.25, transform: [{ scale: 0.8 }] },
  '100%': { opacity: 0.25, transform: [{ scale: 0.8 }] },
};

function BusyDots() {
  const reduce = useReducedMotion();
  return (
    <View className="ml-1 flex-row gap-1" accessible={false}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          className="size-1.5 rounded-full bg-splash-dot"
          style={
            reduce
              ? undefined
              : {
                  animationName: DOT_PULSE,
                  animationDuration: 1200,
                  animationDelay: i * 150,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }
          }
        />
      ))}
    </View>
  );
}

// 동네 이름 버튼과 날짜. 처음 연 사람은 기본 동네가 자기 동네가 아닐 수 있어 누르는 법을 알려준다
export function PlaceHeading({
  locate: { place, placeSaved, error, locate },
  busy,
  dateLabel,
}: {
  locate: Locate;
  busy: boolean;
  dateLabel: string;
}) {
  const ink = useInk();
  const message = error
    ? MESSAGES[error]
    : placeSaved
      ? null
      : '이름을 누르면 지금 위치로 바뀌어요';

  return (
    <View>
      <Pressable
        onPress={() => {
          haptic();
          locate(false);
        }}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={`${place.name}, 현재 위치로 바꾸기`}
        className="flex-row items-center gap-1 self-start"
      >
        <PinIcon size={22} color={ink} />
        <Text className="font-display text-3xl text-ink">
          {busy ? '위치 찾는 중' : place.name}
        </Text>
        {busy && <BusyDots />}
      </Pressable>
      <Text className="font-sans text-sm text-muted">{dateLabel}</Text>
      {message && (
        <Text
          accessibilityLiveRegion="polite"
          lineBreakStrategyIOS="hangul-word"
          className="mt-1 font-sans text-xs text-muted"
        >
          {message}
        </Text>
      )}
    </View>
  );
}

// 튐 없이 끝에서 부드럽게 멈추는 곡선(웹 spring bounce 0과 비슷한 느낌)
const PILL_EASE = cubicBezier(0.25, 1, 0.5, 1);

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'tomorrow', label: '내일' },
];

// 두 개 중 하나를 고르는 토글. 화면 위에 붙어 있어 스크롤한 채로도 바꾼다(index의 stickyHeaderIndices)
export function DayTabs({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const reduce = useReducedMotion();
  // 알약 한 칸 폭. 화면에 그릴 위치를 정하는 값이라 state로 둔다
  const [half, setHalf] = useState(0);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="날짜 선택"
      // 안쪽 여백(p-1) 양쪽 4와 칸 사이(gap-1) 4를 빼고 둘로 나눈다
      onLayout={(event) => setHalf((event.nativeEvent.layout.width - 12) / 2)}
      className="flex-row gap-1 rounded-2xl border-2 border-ink bg-well p-1"
    >
      {/* 선택 알약 하나가 두 칸 사이로 미끄러진다(웹 layoutId spring 0.4초·튐 0) */}
      {half > 0 && (
        <Animated.View
          className="absolute bottom-1 left-1 top-1 rounded-[10px] border-2 border-ink bg-ink"
          style={{
            width: half,
            transform: [{ translateX: tab === 'today' ? 0 : half + 4 }],
            transitionProperty: 'transform',
            transitionDuration: reduce ? 0 : 400,
            transitionTimingFunction: PILL_EASE,
          }}
        />
      )}
      {TABS.map(({ id, label }) => {
        const selected = id === tab;
        return (
          <Pressable
            key={id}
            onPress={() => {
              haptic();
              onChange(id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="h-11 flex-1 items-center justify-center"
          >
            <Text
              className={`text-base ${selected ? 'font-sans-bold text-bg' : 'font-sans-medium text-muted'}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
