import { WeatherView } from '@/components/WeatherView';
import { DEFAULT_PLACE, PLACE_COOKIE, parsePlace } from '@/lib/location';
import { MORNINGS_COOKIE, parseMornings } from '@/lib/mornings';
import {
  fetchForecast,
  isBeforeWork,
  isEvening,
  yesterdayKey,
} from '@/lib/weather';
import { cookies } from 'next/headers';
import { connection } from 'next/server';

export default async function Home({ searchParams }: PageProps<'/'>) {
  // 요청 시각 기준으로 예보와 저녁 여부를 정해야 해서 빌드 시 정적 생성을 막는다.
  await connection();
  const now = new Date();
  const jar = await cookies();
  // 폰 위치를 잡은 적이 있으면 그 동네, 아니면 기본 동네 예보를 그린다.
  const place = parsePlace(jar.get(PLACE_COOKIE)?.value) ?? DEFAULT_PLACE;
  // 어제 아침과는 출근 전까지만 견준다. 그 뒤엔 오늘 하루 이야기가 더 쓸모 있다
  const yesterdayFeel = isBeforeWork(now)
    ? parseMornings(jar.get(MORNINGS_COOKIE)?.value)[yesterdayKey(now)]
    : undefined;
  const [forecast, { day }] = await Promise.all([
    fetchForecast(now, place),
    searchParams,
  ]);

  // 저녁 알림을 누르면 ?day=tomorrow로 들어와 바로 내일 탭을 보여준다.
  return (
    <WeatherView
      forecast={forecast}
      place={place}
      evening={isEvening(now)}
      yesterdayFeel={yesterdayFeel}
      initialTab={day === 'tomorrow' ? 'tomorrow' : 'today'}
    />
  );
}
