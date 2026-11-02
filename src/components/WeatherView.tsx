'use client';

import { AlertButton } from '@/components/AlertButton';
import { FeedbackCard } from '@/components/FeedbackCard';
import { Header, type Tab } from '@/components/Header';
import { HourlyForecast } from '@/components/HourlyForecast';
import { OutfitCard } from '@/components/OutfitCard';
import { OutfitGuide } from '@/components/OutfitGuide';
import { useSplashHold } from '@/components/SplashGate';
import { SummaryCard } from '@/components/SummaryCard';
import { useFeedback } from '@/hooks/useFeedback';
import { useLocate } from '@/hooks/useLocate';
import { useOutfitPicks } from '@/hooks/useOutfitPicks';
import { formatTemp } from '@/lib/format';
import { haptic } from '@/lib/haptic';
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
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type PanInfo,
} from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  forecast: Forecast;
  place: Place;
  evening: boolean;
  // 서버가 이 화면을 그린 시각. 저장된 화면(sw.js)으로 열렸는지 알아보는 데 쓴다
  renderedAt: number;
  // 어제 앱을 안 열었으면 없다
  yesterdayFeel?: number;
  placeSaved: boolean;
  initialTab: Tab;
};

export function WeatherView({
  forecast,
  place,
  evening,
  renderedAt,
  yesterdayFeel,
  placeSaved,
  initialTab,
}: Props) {
  const router = useRouter();
  const location = useLocate(place);
  // 열 때 조용히 위치를 확인하는 동안은 로딩 화면 뒤에서 끝내, 첫 화면이 곧바로 바뀌지 않게 한다
  useSplashHold(location.settling);
  const [tab, setTab] = useState(initialTab);
  const placeKey = `${place.nx}-${place.ny}`;
  // 처음 연 동네는 페이드 없이 그린다. AnimatePresence의 initial={false}는 안쪽 카드의 탭 움직임까지 막아서 쓰지 않는다
  const [openedPlace] = useState(placeKey);
  const { feeling, offset, nextOffset, save } = useFeedback(
    forecast.today.dateKey
  );
  // 퇴근길 안내도 옷 카드에서 고른 옷 이름으로 말한다
  const { choose } = useOutfitPicks();

  // 홈 화면 앱을 켜둔 채 오래 두면 예보가 낡으므로, 다시 볼 때 서버 데이터를 다시 받는다.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () =>
      document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [router]);

  // 저장된 화면으로 열렸으면(그린 지 1분 넘음) 바로 새 날씨를 받아 숫자만 바꾼다
  useEffect(() => {
    if (Date.now() - renderedAt > 60_000) router.refresh();
  }, [router, renderedAt]);

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
        `아침 ${formatTemp(morning.feel)}, ${eveningCommute.phrase} ${formatTemp(eveningCommute.feel)}였어요.`,
        feeling
          ? '기록했어요. 다음에 반영할게요'
          : '옷차림이 어땠는지 알려주세요',
      ]
    : getTake(day, dayOffset, choose);

  // 시간대별은 이미 옆으로 스크롤하는 칸이라 빼고, 세로 스크롤 중 대각선으로 움직여도 탭이 바뀌지 않게 가로가 확실히 클 때만 넘긴다
  const swipe = (event: PointerEvent, { offset, velocity }: PanInfo) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-no-swipe]')
    ) {
      return;
    }
    const distance = Math.abs(offset.x);
    if (distance < Math.abs(offset.y) * 1.5 || distance < 30) return;
    if (distance < 60 && Math.abs(velocity.x) < 500) return;
    const next: Tab = offset.x < 0 ? 'tomorrow' : 'today';
    if (next === tab) return;
    haptic();
    setTab(next);
  };

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
      {/* 옆으로 밀어 탭을 넘긴다. 세로 스크롤과 확대는 브라우저에 맡긴다 */}
      <motion.div
        onPanEnd={swipe}
        className={`flex touch-pan-y touch-pinch-zoom flex-col gap-3 transition-opacity duration-300 ${location.busy ? 'opacity-50' : ''}`}
      >
        {evening && feedback}
        {/* 탭을 바꿔도 카드는 그대로 둬야 숫자가 이전 값에서 굴러간다. 탭 움직임은 각 카드가 맡고, 동네가 바뀔 때만 전체를 페이드한다 */}
        {/* 이전 내용이 흐려진 뒤 새 내용이 나와야 바뀌는 게 보인다. 같은 자리에 바로 들어오면 길게 페이드해도 순식간에 바뀐 것처럼 보인다 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={placeKey}
            initial={placeKey === openedPlace ? false : { opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.3, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: 'easeIn' },
            }}
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
              tab={tab}
            />
            <OutfitCard
              title={
                review
                  ? '오늘 추천했던 옷'
                  : isToday
                    ? '오늘 뭐 입지?'
                    : '내일 뭐 입지?'
              }
              basisLabel={`${review ? '오늘 ' : ''}${morning.phrase} 체감`}
              basisTemp={formatTemp(morning.feel)}
              level={level}
              umbrella={needsUmbrella(day)}
              tab={tab}
            />
            {/* 탭마다 새로 그려야 같은 시각 칸(06시)을 스냅이 다시 따라가지 않는다 */}
            <HourlyForecast
              key={tab}
              hourly={day.hourly}
              highlightFirst={isToday}
            />
          </motion.div>
        </AnimatePresence>
        {!evening && feedback}
        {/* 탭을 바꾸면 표를 닫힌 상태로 다시 시작한다 */}
        <OutfitGuide
          key={tab}
          currentIndex={levelIndex}
          offset={dayOffset}
          basis={morning.phrase}
        />
      </motion.div>
    </MotionConfig>
  );
}
