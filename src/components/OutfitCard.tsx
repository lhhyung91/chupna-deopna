import { ClothingIcon, preloadClothing } from '@/components/ClothingIcon';
import { preloadWeatherIcon, WeatherIcon } from '@/components/WeatherIcon';
import { useEntrance } from '@/hooks/useEntrance';
import { useOutfitPicks } from '@/hooks/useOutfitPicks';
import { haptic } from '@/lib/haptic';
import { SWAP_POP } from '@/lib/motion';
import type { ClothingItem, OutfitLevel } from '@/lib/outfit';
import { motion } from 'motion/react';
import { type ReactNode, useEffect } from 'react';

type Props = {
  title: string;
  // "출근길 체감 6° 기준"에서 숫자만 굵게 쓰려고 나눠 받는다
  basisLabel: string;
  basisTemp: string;
  level: OutfitLevel;
  umbrella: boolean;
  // 다른 탭의 옷. 그림을 미리 받아 둬야 탭을 넘긴 순간 칸이 비지 않는다
  other: { level: OutfitLevel; umbrella: boolean };
};

// 우산까지 4칸이면 375px 한 줄에 들어가게 칸과 그림을 줄인다
const isWide = (items: ClothingItem[], umbrella: boolean) =>
  items.length + (umbrella ? 1 : 0) > 3;

// 새로 붙는 그림만 커지며 나온다. 투명에서 시작하면 그 사이 칸이 비어 보인다
function Pop({ children }: { children: ReactNode }) {
  const { initial, timing } = useEntrance();
  return (
    <motion.span
      initial={initial && { scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={timing(SWAP_POP)}
      className="flex"
    >
      {children}
    </motion.span>
  );
}

export function OutfitCard({
  title,
  basisLabel,
  basisTemp,
  level,
  umbrella,
  other,
}: Props) {
  const { choose, next } = useOutfitPicks();
  const items = choose(level);
  const wide = isWide(items, umbrella);
  const tile = `flex w-full items-center justify-center rounded-2xl border-2 border-ink shadow-well ${wide ? 'h-19' : 'h-23'}`;
  const combo = [
    ...items.map((item) => item.label),
    ...(umbrella ? ['우산'] : []),
  ];

  const otherItems = choose(other.level);
  const otherSize = isWide(otherItems, other.umbrella) ? 56 : 76;
  useEffect(() => {
    for (const item of otherItems) preloadClothing(item.kind, otherSize);
    if (other.umbrella) preloadWeatherIcon('umbrella', 56);
  }, [otherItems, otherSize, other.umbrella]);

  return (
    <section
      aria-label="옷차림 추천"
      className="col-span-6 flex flex-col gap-4 card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        {/* 기준 숫자는 요약 카드의 출근 숫자와 같아서, 여기선 어느 숫자로 골랐는지만 작게 알린다 */}
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <h2 className="rounded-lg bg-ink px-2.5 py-0.5 font-display text-base/5.5 text-bg">
            {title}
          </h2>
          <p className="text-xs font-bold text-muted">
            {basisLabel} <b className="text-ink">{basisTemp}</b> 기준
          </p>
        </div>
        {level.alternatives && (
          <button
            type="button"
            aria-label="다른 옷 조합 보기"
            onClick={() => {
              haptic();
              next(level);
            }}
            className="flex size-11 shrink-0 tactile items-center justify-center rounded-2xl border-2 border-ink bg-card shadow-btn"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
            </svg>
          </button>
        )}
      </div>
      {/* 그림 아래 이름이 보이니 스크린리더엔 조합 한 문장만 읽힌다 */}
      <p className="sr-only">추천 옷차림: {combo.join(' + ')}</p>
      <div
        aria-hidden="true"
        className={`grid ${wide ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3'}`}
      >
        {/* 탭을 넘기거나 조합을 바꿔도 칸은 그대로 두고 옷이 바뀐 칸의 그림만 팝한다. 칸을 새로 그리면 등장하는 동안 옷 카드가 비어 보였다 */}
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <div className={`${tile} tile-ground`}>
              <Pop key={item.kind}>
                <ClothingIcon kind={item.kind} size={wide ? 56 : 76} priority />
              </Pop>
            </div>
            <span className="text-[0.8125rem]/4.5 font-bold whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
        {/* 입는 옷이 아니라 챙길 물건이라 점선 칸으로 구분한다 */}
        {umbrella && (
          <div className="flex flex-col items-center gap-1.5">
            <div className={`${tile} border-dashed tile-ground-accent`}>
              <Pop>
                <WeatherIcon kind="umbrella" size={56} />
              </Pop>
            </div>
            <span className="text-[0.8125rem]/4.5 font-black whitespace-nowrap">
              + 우산
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
