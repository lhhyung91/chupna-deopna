import { WeatherView } from '@/components/WeatherView';
import { fetchForecast, isEvening } from '@/lib/weather';
import { connection } from 'next/server';

export default async function Home({ searchParams }: PageProps<'/'>) {
  // 요청 시각 기준으로 예보와 저녁 여부를 정해야 해서 빌드 시 정적 생성을 막는다.
  await connection();
  const now = new Date();
  const [forecast, { day }] = await Promise.all([
    fetchForecast(now),
    searchParams,
  ]);

  // 저녁 알림을 누르면 ?day=tomorrow로 들어와 바로 내일 탭을 보여준다.
  return (
    <WeatherView
      forecast={forecast}
      evening={isEvening(now)}
      initialTab={day === 'tomorrow' ? 'tomorrow' : 'today'}
    />
  );
}
