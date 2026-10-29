'use client';

import { AlertButton } from '@/components/AlertButton';
import { BannerList } from '@/components/BannerList';
import { CommuteCards } from '@/components/CommuteCards';
import { FeedbackCard } from '@/components/FeedbackCard';
import { Header, type Tab } from '@/components/Header';
import { HourlyForecast } from '@/components/HourlyForecast';
import { OutfitCard } from '@/components/OutfitCard';
import { OutfitGuide } from '@/components/OutfitGuide';
import { WeatherHero } from '@/components/WeatherHero';
import { useFeedback } from '@/hooks/useFeedback';
import { formatTemp } from '@/lib/format';
import type { Place } from '@/lib/location';
import {
  getBanners,
  getEveningNote,
  getFocusCommute,
  getLevelIndex,
  getWetBanner,
  LEVELS,
} from '@/lib/outfit';
import type { Forecast } from '@/lib/weather';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  forecast: Forecast;
  place: Place;
  evening: boolean;
  hour: number;
  initialTab: Tab;
};

export function WeatherView({
  forecast,
  place,
  evening,
  hour,
  initialTab,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
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
  // 아침에 입고 나갈 옷이 먼저라 출근길로 고르고, 퇴근길은 아래 한 줄로 따로 알려준다.
  const [morning, eveningCommute] = day.commutes;
  const levelIndex = getLevelIndex(morning.feel - offset);
  const level = LEVELS[levelIndex];
  const banners = getBanners(day);
  const wet = getWetBanner(banners);

  // 저녁엔 피드백을 맨 위로 올린다. CSS order 대신 DOM 순서를 바꿔야 탭 이동 순서도 맞는다.
  const feedback = isToday && (
    <FeedbackCard feeling={feeling} offset={offset} onSelect={save} />
  );

  return (
    // 시스템의 "동작 줄이기"가 켜져 있으면 아래 모든 모션을 끈다
    <MotionConfig reducedMotion="user">
      <Header
        place={place}
        dateLabel={day.dateLabel}
        tab={tab}
        onTabChange={setTab}
        action={<AlertButton offset={offset} place={place} />}
      />
      <div className="flex flex-col gap-3">
        {evening && feedback}
        {/* 탭마다 새로 그려야 같은 시각 칸(06시)을 스냅이 다시 따라가지 않는다. 기다림 없이 들어오기만 한다 */}
        <AnimatePresence initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: isToday ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="grid grid-cols-6 gap-3"
          >
            {/* 날씨를 먼저 보고 "그래서 이 옷"으로 이어지게 날씨·비 칸을 옷차림 위에 둔다 */}
            <WeatherHero
              now={forecast.now}
              day={day}
              isToday={isToday}
              wet={wet}
            />
            <OutfitCard
              title={isToday ? '오늘 뭐 입지?' : '내일 뭐 입지?'}
              basis={`출근길 ${formatTemp(morning.feel)}처럼 느껴져요`}
              items={level.items}
              eveningNote={getEveningNote(morning, eveningCommute, offset)}
              tip={level.tip}
            />
            {/* 비·눈은 위 날씨 옆 칸에 있으니 나머지(강풍·일교차)만 */}
            <BannerList banners={banners.filter((banner) => banner !== wet)} />
            {/* 내일 탭은 아침 옷이 기준이라 늘 출근을 크게 */}
            <CommuteCards
              commutes={day.commutes}
              focus={getFocusCommute(isToday ? hour : 0)}
            />
            <HourlyForecast hourly={day.hourly} highlightFirst={isToday} />
          </motion.div>
        </AnimatePresence>
        {!evening && feedback}
        <OutfitGuide currentIndex={levelIndex} offset={offset} />
      </div>
    </MotionConfig>
  );
}
