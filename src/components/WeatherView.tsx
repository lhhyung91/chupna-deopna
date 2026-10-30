'use client';

import { AlertButton } from '@/components/AlertButton';
import { FeedbackCard } from '@/components/FeedbackCard';
import { Header, type Tab } from '@/components/Header';
import { HourlyForecast } from '@/components/HourlyForecast';
import { OutfitCard } from '@/components/OutfitCard';
import { OutfitGuide } from '@/components/OutfitGuide';
import { SplashScreen } from '@/components/SplashScreen';
import { SummaryCard } from '@/components/SummaryCard';
import { useFeedback } from '@/hooks/useFeedback';
import { useLocate } from '@/hooks/useLocate';
import { useSplash } from '@/hooks/useSplash';
import { formatTemp } from '@/lib/format';
import type { Place } from '@/lib/location';
import { MORNINGS_COOKIE, nextMornings } from '@/lib/mornings';
import {
  getLevelIndex,
  getSkyNote,
  getTake,
  LEVELS,
  needsUmbrella,
  type MorningCompare,
  type Take,
} from '@/lib/outfit';
import type { Forecast } from '@/lib/weather';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  forecast: Forecast;
  place: Place;
  evening: boolean;
  // 어제 앱을 안 열었으면 없다
  yesterdayFeel?: number;
  placeSaved: boolean;
  initialTab: Tab;
};

export function WeatherView({
  forecast,
  place,
  evening,
  yesterdayFeel,
  placeSaved,
  initialTab,
}: Props) {
  const router = useRouter();
  const location = useLocate(place);
  // 열 때 조용히 위치를 확인하는 동안은 로딩 화면 뒤에서 끝내, 첫 화면이 곧바로 바뀌지 않게 한다
  const splash = useSplash(location.settling);
  const [tab, setTab] = useState(initialTab);
  const { feeling, offset, nextOffset, save } = useFeedback(
    forecast.today.dateKey
  );

  // 홈 화면 앱을 켜둔 채 오래 두면 예보가 낡으므로, 다시 볼 때 서버 데이터를 다시 받는다.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () =>
      document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [router]);

  // 서버 액션으로 쿠키를 쓰면 화면을 다시 그려서, 브라우저에서 바로 적는다
  const todayKey = forecast.today.dateKey;
  const todayFeel = forecast.today.commutes[0].feel;
  useEffect(() => {
    const current = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(`${MORNINGS_COOKIE}=`))
      ?.slice(MORNINGS_COOKIE.length + 1);
    document.cookie = `${MORNINGS_COOKIE}=${nextMornings(current, todayKey, todayFeel)}; max-age=${3 * 24 * 60 * 60}; path=/; samesite=lax`;
  }, [todayKey, todayFeel]);

  const isToday = tab === 'today';
  // 저녁 오늘 탭은 내일 얘기 없이 오늘 출퇴근을 돌아본다
  const review = isToday && evening;
  const day = isToday ? forecast.today : forecast.tomorrow;
  const dayOffset = isToday ? offset : nextOffset;
  const [morning, eveningCommute] = day.commutes;
  // 아침에 입고 나갈 옷이 먼저라 출근길로 고른다
  const levelIndex = getLevelIndex(morning.feel - dayOffset);
  const level = LEVELS[levelIndex];
  const compare: MorningCompare | undefined = isToday
    ? yesterdayFeel === undefined
      ? undefined
      : { label: '어제', feel: yesterdayFeel }
    : { label: '오늘', feel: todayFeel };
  // 한 줄에 들어가야 해서 "체감"은 뺀다. 위 출퇴근 숫자가 이미 체감이다
  const take: Take = review
    ? [
        `아침 ${formatTemp(morning.feel)}, 퇴근길 ${formatTemp(eveningCommute.feel)}였어요.`,
        feeling
          ? '기록했어요. 다음에 반영할게요'
          : '옷차림이 어땠는지 알려주세요',
      ]
    : getTake(day, dayOffset);

  // 저녁엔 피드백을 맨 위로 올린다. CSS order 대신 DOM 순서를 바꿔야 탭 이동 순서도 맞는다.
  const feedback = isToday && (
    <FeedbackCard feeling={feeling} offset={offset} onSelect={save} />
  );

  return (
    // 시스템의 "동작 줄이기"가 켜져 있으면 아래 모든 모션을 끈다
    <MotionConfig reducedMotion="user">
      <Header
        place={place}
        placeSaved={placeSaved}
        locate={location}
        dateLabel={day.dateLabel}
        tab={tab}
        onTabChange={setTab}
        // 알림은 내일 옷을 알려주니 오늘 누른 피드백까지 반영한다
        action={<AlertButton offset={nextOffset} place={place} />}
      />
      {/* 새 동네 예보가 올 때까지 흐리게 둬서, 지금 보이는 게 곧 바뀐다는 걸 알린다 */}
      <div
        className={`flex flex-col gap-3 transition-opacity duration-300 ${location.busy ? 'opacity-50' : ''}`}
      >
        {evening && feedback}
        {/* 탭마다 새로 그려야 같은 시각 칸(06시)을 스냅이 다시 따라가지 않는다. 동네가 바뀌어도 같은 페이드로 들어온다 */}
        <AnimatePresence initial={false}>
          <motion.div
            key={`${tab}-${place.nx}-${place.ny}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="grid grid-cols-6 gap-3"
          >
            <SummaryCard
              now={isToday ? forecast.now : undefined}
              day={day}
              compare={compare}
              note={
                review
                  ? '오늘 하루 정리'
                  : getSkyNote(day, isToday ? forecast.now.sky : undefined)
              }
              take={take}
              past={review}
            />
            <OutfitCard
              title={
                review
                  ? '오늘 추천했던 옷'
                  : isToday
                    ? '오늘 뭐 입지?'
                    : '내일 뭐 입지?'
              }
              basis={`${review ? '오늘 ' : ''}출근길 체감 ${formatTemp(morning.feel)} 기준`}
              items={level.items}
              umbrella={needsUmbrella(day)}
            />
            <HourlyForecast hourly={day.hourly} highlightFirst={isToday} />
          </motion.div>
        </AnimatePresence>
        {!evening && feedback}
        {/* 탭을 바꾸면 표를 닫힌 상태로 다시 시작한다 */}
        <OutfitGuide key={tab} currentIndex={levelIndex} offset={dayOffset} />
      </div>
      {splash !== 'gone' && <SplashScreen leaving={splash === 'leaving'} />}
    </MotionConfig>
  );
}
