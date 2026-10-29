import { WeatherView } from '@/components/WeatherView';
import { DEFAULT_PLACE, PLACE_COOKIE, parsePlace } from '@/lib/location';
import { fetchForecast, isEvening, kstHour } from '@/lib/weather';
import { cookies } from 'next/headers';
import { connection } from 'next/server';

export default async function Home({ searchParams }: PageProps<'/'>) {
  // 요청 시각 기준으로 예보와 저녁 여부를 정해야 해서 빌드 시 정적 생성을 막는다.
  await connection();
  const now = new Date();
  // 폰 위치를 잡은 적이 있으면 그 동네, 아니면 기본 동네 예보를 그린다.
  const place =
    parsePlace((await cookies()).get(PLACE_COOKIE)?.value) ?? DEFAULT_PLACE;
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
      hour={kstHour(now)}
      initialTab={day === 'tomorrow' ? 'tomorrow' : 'today'}
    />
  );
}
