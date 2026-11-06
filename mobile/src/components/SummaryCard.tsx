import { formatTemp, SKY_LABEL } from '@/lib/format';
import {
  compareMornings,
  getCommuteDelta,
  getRainChange,
  type MorningCompare,
  type Take,
} from '@/lib/outfit';
import type { CommuteWeather, DayWeather, NowWeather } from '@/lib/weather';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Card } from '~/components/Card';
import type { Tab } from '~/components/Header';
import { ArrowHeadIcon } from '~/components/Icons';
import { RollingNumber } from '~/components/RollingNumber';
import { WeatherIcon } from '~/components/WeatherIcon';
import { useEntrance } from '~/hooks/useEntrance';
import {
  ARROW_IN,
  BADGE_POP,
  LINE_DRAW,
  SOFT_FADE,
  TEXT_FADE,
} from '~/lib/motion';
import { useInk } from '~/lib/theme';

type Props = {
  // 내일 탭엔 지금 기온이 없다
  now?: NowWeather;
  day: DayWeather;
  // 어제(내일 탭은 오늘) 출근 체감. 어제 앱을 안 열었으면 없다
  compare?: MorningCompare;
  note: string | null;
  take: Take;
  // 저녁 오늘 탭: 오늘 출퇴근을 돌아보는 말투로 쓴다
  past: boolean;
  // 움직임을 탭마다 다시 트는 key
  tab: Tab;
};

const formatDelta = (delta: number) =>
  delta > 0 ? `+${delta}°` : delta < 0 ? `−${-delta}°` : '0°';

// 3° 넘게 달라지면 색으로도 알리고, 비슷하면 칩 색으로 둔다
const deltaClass = (delta: number) =>
  delta >= 3
    ? ['bg-delta-up', 'text-on-bright']
    : delta <= -3
      ? ['bg-delta-down', 'text-on-bright']
      : ['bg-chip', 'text-ink'];

// 큰 숫자는 옷을 고른 체감이고, 기온과 비·눈 소식은 아래 작은 글씨로 둔다
function Commute({
  commute,
  end,
  tab,
}: {
  commute: CommuteWeather;
  end: boolean;
  tab: Tab;
}) {
  return (
    <View className={end ? 'items-end' : 'items-start'}>
      <Text className="font-sans-bold text-xs text-muted">
        {commute.label} {commute.time}
      </Text>
      <View className="flex-row items-center gap-1">
        <WeatherIcon kind={commute.sky} size={36} />
        <RollingNumber value={commute.temp} turn={tab} />
      </View>
      <Text className="font-sans-bold text-xs tabular-nums text-muted">
        체감 {formatTemp(commute.feel)}
      </Text>
    </View>
  );
}

export function SummaryCard({
  now,
  day,
  compare,
  note,
  take,
  past,
  tab,
}: Props) {
  const ink = useInk();
  // 첫 화면은 움직임 없이, 탭을 바꿔 새로 붙을 때만(키가 tab)
  const animate = useEntrance();
  const enter = <T,>(animation: T) => (animate ? animation : undefined);
  const sky = now?.sky ?? day.sky;
  const [morning, evening] = day.commutes;
  const { delta, text } = getCommuteDelta(morning, evening, past);
  const rain = getRainChange(day.commutes);
  const vsMorning = compare && compareMornings(compare, morning, past);
  const [badgeBg, badgeText] = deltaClass(delta);

  return (
    <Card className="gap-2.5 px-4 pb-4 pt-3.5">
      <View className="gap-1">
        <Animated.View
          key={tab}
          entering={enter(SOFT_FADE)}
          className="flex-row items-center gap-2"
        >
          <WeatherIcon kind={sky} size={44} />
          {now ? (
            <>
              <Text className="font-num-bold text-4xl tabular-nums tracking-[-1px] text-ink">
                {formatTemp(now.temp)}
              </Text>
              <Text className="font-sans-bold text-base text-ink">
                <Text className="text-xs text-muted">지금</Text>{' '}
                {SKY_LABEL[sky]}
              </Text>
            </>
          ) : (
            // 내일은 지금 기온이 없어 하늘을 그 자리에 크게 둔다. "내일"은 탭이 이미 말한다
            <Text className="font-sans-bold text-4xl tracking-[-1px] text-ink">
              {SKY_LABEL[sky]}
            </Text>
          )}
          <Text className="ml-auto flex-1 text-right font-sans text-xs tabular-nums text-muted">
            최고{' '}
            <Text className="font-sans-bold text-ink">
              {formatTemp(day.max)}
            </Text>{' '}
            / 최저{' '}
            <Text className="font-sans-bold text-ink">
              {formatTemp(day.min)}
            </Text>
          </Text>
        </Animated.View>
        {/* 내용이 없어도 한 줄 높이를 남겨, 탭을 넘겨도 카드 높이가 같다 */}
        <Animated.Text
          key={`${tab}-note`}
          entering={enter(TEXT_FADE)}
          accessibilityLabel={
            vsMorning
              ? [vsMorning.spoken, note].filter(Boolean).join(', ')
              : (note ?? undefined)
          }
          className="min-h-4 font-sans text-xs tabular-nums text-muted"
        >
          {vsMorning?.text}
          {vsMorning && note ? ' · ' : ''}
          {note}
        </Animated.Text>
      </View>

      <View
        accessible
        accessibilityLabel={`${morning.label} ${morning.time} 기온 ${formatTemp(morning.temp)} 체감 ${formatTemp(morning.feel)}, ${evening.label} ${evening.time} 기온 ${formatTemp(evening.temp)} 체감 ${formatTemp(evening.feel)}, ${text}${rain ? `, ${rain}` : ''}`}
        className="flex-row items-center gap-2"
      >
        <Commute commute={morning} end={false} tab={tab} />
        {/* 차이는 배지 숫자와 색이 말한다. 글자로 쓰면 위 "어제보다"와 같은 비교로 읽힌다 */}
        {/* 선이 아침에서 저녁으로 그려진 뒤 배지가 튀어나와 "이만큼 변한다"는 흐름이 보이게 한다 */}
        <View key={tab} className="min-w-0 flex-1 items-center gap-px">
          <Animated.View
            entering={enter(BADGE_POP)}
            className={`rounded-full border-2 border-ink px-2.5 py-0.5 ${badgeBg}`}
          >
            <Text
              className={`font-num-bold text-[0.9375rem]/5 tabular-nums ${badgeText}`}
            >
              {formatDelta(delta)}
            </Text>
          </Animated.View>
          <View className="h-3.5 w-full flex-row items-center">
            {/* 아침에서 저녁 쪽으로 그려져야 해서 왼쪽 끝을 기준으로 늘린다(NativeWind origin-left는 안 먹어서 style) */}
            <Animated.View
              entering={enter(LINE_DRAW)}
              className="h-[2.5px] flex-1 bg-ink"
              style={{ transformOrigin: 'left' }}
            />
            <Animated.View
              entering={enter(ARROW_IN)}
              className="absolute -right-0.5"
            >
              <ArrowHeadIcon color={ink} />
            </Animated.View>
            {/* 칸 아래가 원래 비어 있어(양쪽 칸이 한 줄 더 높음) 높이를 늘리지 않고 띄워 놓는다. 글이 칸보다 길 수 있어 양옆으로 넓힌다 */}
            {rain && (
              <Animated.Text
                entering={enter(TEXT_FADE)}
                numberOfLines={1}
                className="absolute -left-6 -right-6 top-full mt-0.5 text-center font-sans-bold text-xs tabular-nums text-pop"
              >
                {rain}
              </Animated.Text>
            )}
          </View>
        </View>
        <Commute commute={evening} end tab={tab} />
      </View>

      {/* 문구 길이와 상관없이 날마다 같은 높이로 둔다 */}
      <View className="min-h-16 justify-center gap-0.5 rounded-[0.875rem] border border-hint-line bg-hint px-3 py-2.5">
        {/* 칸은 그대로 두고 글만 페이드한다 */}
        <Animated.Text
          key={`${tab}-0`}
          entering={enter(TEXT_FADE)}
          lineBreakStrategyIOS="hangul-word"
          className="font-sans-bold text-[0.9375rem]/5 text-ink"
        >
          {take[0]}
        </Animated.Text>
        <Animated.Text
          key={`${tab}-1`}
          entering={enter(TEXT_FADE)}
          lineBreakStrategyIOS="hangul-word"
          className="font-sans-medium text-sm/5 text-hint-sub"
        >
          {take[1]}
        </Animated.Text>
      </View>
    </Card>
  );
}
