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
import { useState } from 'react';

type Props = { forecast: Forecast; evening: boolean };

export function WeatherView({ forecast, evening }: Props) {
  const [tab, setTab] = useState<Tab>('today');
  const { feeling, offset, save } = useFeedback(forecast.today.dateKey);

  const isToday = tab === 'today';
  const day = isToday ? forecast.today : forecast.tomorrow;
  const [morning] = day.commutes;

  // 저녁엔 피드백을 맨 위로 올린다. CSS order 대신 DOM 순서를 바꿔야 탭 이동 순서도 맞는다.
  const feedback = isToday && (
    <FeedbackCard feeling={feeling} offset={offset} onSelect={save} />
  );

  return (
    <>
      <Header
        dateLabel={day.dateLabel}
        status={`${forecast.updatedAt} 업데이트`}
        tab={tab}
        onTabChange={setTab}
      />
      <div className="flex flex-col gap-4">
        {evening && feedback}
        <OutfitCard
          title={isToday ? '오늘의 옷차림' : '내일의 옷차림'}
          basis={`출근길 체감 ${formatTemp(morning.feel)} 기준`}
          items={recommendOutfit(morning.feel - offset)}
        />
        <BannerList banners={getBanners(day)} />
        <CommuteCards commutes={day.commutes} />
        <SummaryCard day={day} />
        <HourlyForecast hourly={day.hourly} highlightFirst={isToday} />
        {!evening && feedback}
      </div>
    </>
  );
}
