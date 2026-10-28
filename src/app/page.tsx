import { WeatherView } from '@/components/WeatherView';
import { fetchForecast, isEvening } from '@/lib/weather';
import { connection } from 'next/server';

export default async function Home() {
  // 요청 시각 기준으로 예보와 저녁 여부를 정해야 해서 빌드 시 정적 생성을 막는다.
  await connection();
  const now = new Date();
  const forecast = await fetchForecast(now);

  return <WeatherView forecast={forecast} evening={isEvening(now)} />;
}
