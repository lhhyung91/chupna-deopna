'use client';

import { BannerList } from '@/components/BannerList';
import { CommuteCards } from '@/components/CommuteCards';
import { FeedbackCard } from '@/components/FeedbackCard';
import { Header, type Tab } from '@/components/Header';
import { HourlyForecast } from '@/components/HourlyForecast';
import { OutfitCard } from '@/components/OutfitCard';
import { SummaryCard } from '@/components/SummaryCard';
import { useFeedback } from '@/hooks/useFeedback';
import { formatTemp } from '@/lib/format';
import { getBanners, recommendOutfit } from '@/lib/outfit';
import type { Forecast } from '@/lib/weather';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = { forecast: Forecast; evening: boolean };

export function WeatherView({ forecast, evening }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('today');
  const { feeling, offset, save } = useFeedback(forecast.today.dateKey);

  // 홈 화면 앱을 켜둔 채 오래 두면 예보가 낡으므로, 다시 볼 때 서버 데이터를 다시 받는다.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () =>
      document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [router]);

  const isToday = tab === 'today';
  const day = isToday ? forecast.today : forecast.tomorrow;
  // 하루 중 가장 추운 출근길만 보면 너무 두꺼워져서, 밖에 있는 두 시간대의 평균을 쓴다.
  const outsideFeel =
    day.commutes.reduce((sum, c) => sum + c.feel, 0) / day.commutes.length;

  // 저녁엔 피드백을 맨 위로 올린다. CSS order 대신 DOM 순서를 바꿔야 탭 이동 순서도 맞는다.
  const feedback = isToday && (
    <FeedbackCard feeling={feeling} offset={offset} onSelect={save} />
  );

  return (
    <>
      <Header
        dateLabel={day.dateLabel}
        status={`${forecast.updatedAt} 예보`}
        tab={tab}
        onTabChange={setTab}
      />
      <div className="flex flex-col gap-4">
        {evening && feedback}
        <OutfitCard
          title={isToday ? '오늘의 옷차림' : '내일의 옷차림'}
          basis={`출퇴근 평균 체감 ${formatTemp(outsideFeel)}`}
          items={recommendOutfit(outsideFeel - offset)}
        />
        <BannerList banners={getBanners(day)} />
        <CommuteCards commutes={day.commutes} />
        <SummaryCard day={day} />
        {/* 같은 시각 칸(예: 06시)이 두 탭에 다 있으면 스냅이 그 칸으로 다시 스크롤하므로 탭마다 새로 그린다 */}
        <HourlyForecast
          key={tab}
          hourly={day.hourly}
          highlightFirst={isToday}
        />
        {!evening && feedback}
      </div>
    </>
  );
}
