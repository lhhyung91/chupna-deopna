import type { Feeling } from '@/lib/feedback';
import { formatTemp } from '@/lib/format';
import {
  type ChooseOutfit,
  getLevelIndex,
  getSkyNote,
  getTake,
  LEVELS,
  type MorningCompare,
  needsUmbrella,
  type Take,
} from '@/lib/outfit';
import type { Forecast } from '@/lib/weather';

type Input = {
  forecast: Forecast;
  isToday: boolean;
  evening: boolean;
  offset: number;
  nextOffset: number;
  // 어제 앱을 안 열었으면 없다
  yesterdayFeel?: number;
  feeling: Feeling | null;
  choose: ChooseOutfit;
};

// 한 탭 화면에 들어갈 값을 고른다. 웹(WeatherView)과 앱이 같은 문구·옷을 보여주도록 한 곳에서 계산한다
export function getDayView({
  forecast,
  isToday,
  evening,
  offset,
  nextOffset,
  yesterdayFeel,
  feeling,
  choose,
}: Input) {
  // 저녁 오늘 탭은 내일 얘기 없이 오늘 출퇴근을 돌아본다
  const review = isToday && evening;
  const day = isToday ? forecast.today : forecast.tomorrow;
  const dayOffset = isToday ? offset : nextOffset;
  const [morning, eveningCommute] = day.commutes;
  // 아침에 입고 나갈 옷이 먼저라 출근길로 고른다
  const levelIndex = getLevelIndex(morning.feel - dayOffset);
  const otherDay = isToday ? forecast.tomorrow : forecast.today;
  const otherLevel =
    LEVELS[
      getLevelIndex(otherDay.commutes[0].feel - (isToday ? nextOffset : offset))
    ];
  const compare: MorningCompare | undefined = isToday
    ? yesterdayFeel === undefined
      ? undefined
      : { label: '어제', feel: yesterdayFeel }
    : { label: '오늘', feel: forecast.today.commutes[0].feel };
  // 한 줄에 들어가야 해서 "체감"은 뺀다. 위 출퇴근 숫자가 이미 체감이다
  const take: Take = review
    ? [
        `아침 ${formatTemp(morning.feel)}, ${eveningCommute.phrase} ${formatTemp(eveningCommute.feel)}였어요.`,
        feeling
          ? '기록했어요. 다음에 반영할게요'
          : '옷차림이 어땠는지 알려주세요',
      ]
    : getTake(day, dayOffset, choose);

  return {
    review,
    day,
    now: isToday ? forecast.now : undefined,
    dayOffset,
    morning,
    levelIndex,
    level: LEVELS[levelIndex],
    umbrella: needsUmbrella(day),
    other: { level: otherLevel, umbrella: needsUmbrella(otherDay) },
    compare,
    take,
    note: review
      ? '오늘 하루 정리'
      : getSkyNote(day, isToday ? forecast.now.sky : undefined),
    outfitTitle: review
      ? '오늘 추천했던 옷'
      : isToday
        ? '오늘 뭐 입지?'
        : '내일 뭐 입지?',
    basisLabel: `${review ? '오늘 ' : ''}${morning.phrase} 체감`,
    basisTemp: formatTemp(morning.feel),
  };
}
