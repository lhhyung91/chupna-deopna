import { formatTemp } from '@/lib/format';
import { getBanners, getLevelIndex, getWetBanner, LEVELS } from '@/lib/outfit';
import type { Forecast } from '@/lib/weather';

// 출근길 체감이 이만큼 달라지면 옷이 두 단계쯤 바뀐다.
const BIG_CHANGE = 5;

export type EveningAlert = { title: string; body: string };

// 매일 보내면 무시하게 되니, 내일이 오늘과 다를 때만 알린다. force는 배포 후 수신 테스트용이다.
export function getEveningAlert(
  { today, tomorrow }: Forecast,
  offset: number,
  force = false
): EveningAlert | null {
  const [todayMorning] = today.commutes;
  const [morning] = tomorrow.commutes;
  const combo = LEVELS[getLevelIndex(morning.feel - offset)].items
    .map((item) => item.label)
    .join(' + ');
  const wet = getWetBanner(getBanners(tomorrow));
  // 카드에 보이는 반올림 값끼리 비교해야 알림 숫자와 화면 숫자가 맞는다.
  const diff = Math.round(morning.feel) - Math.round(todayMorning.feel);
  const feelTitle = `내일 출근길 체감 ${formatTemp(morning.feel)}`;

  if (Math.abs(diff) >= BIG_CHANGE) {
    return {
      title: `${feelTitle}, 오늘보다 ${Math.abs(diff)}° ${diff < 0 ? '추워요' : '따뜻해요'}`,
      body: wet ? `${combo}, ${wet.text}` : combo,
    };
  }
  if (wet) return { title: `내일 ${wet.title}`, body: `${wet.text}, ${combo}` };
  if (force) return { title: feelTitle, body: combo };
  return null;
}
