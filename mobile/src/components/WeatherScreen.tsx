import { getDayView } from '@/lib/dayView';
import { nextMornings, parseMornings } from '@/lib/mornings';
import type { Forecast } from '@/lib/weather';
import { isEvening, yesterdayKey } from '@/lib/weather';
import { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  type ScrollViewInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedbackCard } from '~/components/FeedbackCard';
import { DayTabs, PlaceHeading, type Tab } from '~/components/Header';
import { HourlyForecast } from '~/components/HourlyForecast';
import { OutfitCard } from '~/components/OutfitCard';
import { OutfitGuide } from '~/components/OutfitGuide';
import { SummaryCard } from '~/components/SummaryCard';
import { useFeedback } from '~/hooks/useFeedback';
import type { Locate } from '~/hooks/useLocate';
import { useOutfitPicks } from '~/hooks/useOutfitPicks';
import { readStored, useStored, writeStored } from '~/lib/store';

const NOISE = require('~/assets/texture_noise.png');

type Props = {
  forecast: Forecast;
  locate: Locate;
  // 위치를 찾거나 새 동네 예보를 기다리는 중
  busy: boolean;
};

// 웹 WeatherView와 같은 화면. 무엇을 보여줄지는 웹과 같은 getDayView가 정한다
export function WeatherScreen({ forecast, locate, busy }: Props) {
  const [tab, setTab] = useState<Tab>('today');
  const scrollRef = useRef<ScrollViewInstance>(null);
  // 온도별 표 위치와 위에 붙는 탭 높이. 펼칠 때 화면을 옮기는 데만 쓰고 그리는 데는 안 써서 ref로 둔다
  const guideY = useRef(0);
  const tabsHeight = useRef(0);
  const { feeling, offset, nextOffset, save } = useFeedback(
    forecast.today.dateKey
  );
  const { choose } = useOutfitPicks();
  const now = new Date();
  const evening = isEvening(now);
  const yesterdayFeel = parseMornings(useStored('mornings') ?? undefined)[
    yesterdayKey(now)
  ];

  // 예보 API는 지난날 아침 값을 다시 주지 않아서, "어제보다"를 쓰려고 날마다 출근 체감을 남긴다
  const todayKey = forecast.today.dateKey;
  const todayFeel = forecast.today.commutes[0].feel;
  useEffect(() => {
    writeStored(
      'mornings',
      nextMornings(readStored('mornings') ?? undefined, todayKey, todayFeel)
    );
  }, [todayKey, todayFeel]);

  const isToday = tab === 'today';
  const view = getDayView({
    forecast,
    isToday,
    evening,
    offset,
    nextOffset,
    yesterdayFeel,
    feeling,
    choose,
  });

  // 내려간 채 탭을 바꿔도 새 탭은 요약부터 보여야 한다
  const changeTab = (next: Tab) => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setTab(next);
  };

  // 저녁엔 피드백을 맨 위로 올린다
  const feedback = isToday && (
    <FeedbackCard feeling={feeling} offset={offset} onSelect={save} />
  );
  const dim = busy ? 'opacity-50' : '';

  return (
    <ImageBackground
      source={NOISE}
      resizeMode="repeat"
      className="flex-1 bg-bg"
    >
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          ref={scrollRef}
          stickyHeaderIndices={[1]}
          contentContainerClassName="gap-3 px-5 pt-6 pb-8"
        >
          <PlaceHeading
            locate={locate}
            busy={busy}
            dateLabel={view.day.dateLabel}
          />
          {/* 위에 붙는 탭도 바탕과 같은 면이어야 아래로 지나가는 카드가 비치지 않는다 */}
          <ImageBackground
            source={NOISE}
            resizeMode="repeat"
            onLayout={(event) => {
              tabsHeight.current = event.nativeEvent.layout.height;
            }}
            className="-mx-5 -mt-1 bg-bg px-5 py-2"
          >
            <DayTabs tab={tab} onChange={changeTab} />
          </ImageBackground>
          <View className={`gap-3 ${dim}`}>
            {evening && feedback}
            <SummaryCard
              now={view.now}
              day={view.day}
              compare={view.compare}
              note={view.note}
              take={view.take}
              past={view.review}
            />
            <OutfitCard
              title={view.outfitTitle}
              basisLabel={view.basisLabel}
              basisTemp={view.basisTemp}
              level={view.level}
              umbrella={view.umbrella}
            />
            {/* 탭마다 새로 그려 시간대 스크롤을 처음으로 되돌린다 */}
            <HourlyForecast
              key={tab}
              hourly={view.day.hourly}
              highlightFirst={isToday}
            />
            {!evening && feedback}
          </View>
          <View
            className={dim}
            onLayout={(event) => {
              guideY.current = event.nativeEvent.layout.y;
            }}
          >
            {/* 탭을 바꾸면 표를 닫힌 상태로 다시 시작한다 */}
            <OutfitGuide
              key={tab}
              currentIndex={view.levelIndex}
              offset={view.dayOffset}
              basis={view.morning.phrase}
              onOpen={() =>
                scrollRef.current?.scrollTo({
                  // 위에 붙은 탭에 가리지 않게 그 아래로 맞춘다
                  y: guideY.current - tabsHeight.current - 8,
                })
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
