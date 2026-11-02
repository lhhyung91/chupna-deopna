import { ClothingIcon } from '@/components/ClothingIcon';
import type { Tab } from '@/components/Header';
import { WeatherIcon } from '@/components/WeatherIcon';
import { useEntrance } from '@/hooks/useEntrance';
import { useOutfitPicks } from '@/hooks/useOutfitPicks';
import { haptic } from '@/lib/haptic';
import { SWAP_POP, tileEntrance } from '@/lib/motion';
import type { OutfitLevel } from '@/lib/outfit';
import { motion } from 'motion/react';

type Props = {
  title: string;
  // "출근길 체감 6° 기준"에서 숫자만 굵게 쓰려고 나눠 받는다
  basisLabel: string;
  basisTemp: string;
  level: OutfitLevel;
  umbrella: boolean;
  // 옷이 같아도 탭을 바꾸면 다시 올라와 "새로 골랐다"는 신호를 준다
  tab: Tab;
};

const TILE = {
  hidden: { opacity: 0, y: 14, scale: 0.9 },
  shown: { opacity: 1, y: 0, scale: 1 },
};

export function OutfitCard({
  title,
  basisLabel,
  basisTemp,
  level,
  umbrella,
  tab,
}: Props) {
  const { animate, timing } = useEntrance();
  const { choose, next } = useOutfitPicks();
  const items = choose(level);
  // 우산까지 4칸이면 375px 한 줄에 들어가게 칸과 그림을 줄인다
  const wide = items.length + (umbrella ? 1 : 0) > 3;
  const tile = `flex w-full items-center justify-center rounded-2xl border-2 border-ink shadow-well ${wide ? 'h-19' : 'h-23'}`;
  const combo = [
    ...items.map((item) => item.label),
    ...(umbrella ? ['우산'] : []),
  ];

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
        key={tab}
        aria-hidden="true"
        className={`grid ${wide ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3'}`}
      >
        {/* 칸 자리(index)를 key로 둬서, 조합을 바꿔도 칸은 그대로 있고 바뀐 그림만 팝한다 */}
        {items.map((item, index) => (
          <motion.div
            key={index}
            variants={TILE}
            initial="hidden"
            animate={animate}
            transition={timing(tileEntrance(index))}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`${tile} tile-ground`}>
              {/* 옷이 바뀌면 그림이 새로 붙으며 팝한다. 탭을 바꿀 땐 칸이 숨은 채(등장 지연 동안) 끝나서 보이지 않는다 */}
              <motion.span
                key={item.kind}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={timing(SWAP_POP)}
                className="flex"
              >
                <ClothingIcon kind={item.kind} size={wide ? 56 : 76} priority />
              </motion.span>
            </div>
            <span className="text-[0.8125rem]/4.5 font-bold whitespace-nowrap">
              {item.label}
            </span>
          </motion.div>
        ))}
        {/* 입는 옷이 아니라 챙길 물건이라 점선 칸으로 구분한다 */}
        {umbrella && (
          <motion.div
            variants={TILE}
            initial="hidden"
            animate={animate}
            transition={timing(tileEntrance(items.length))}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`${tile} border-dashed tile-ground-accent`}>
              <WeatherIcon kind="umbrella" size={56} />
            </div>
            <span className="text-[0.8125rem]/4.5 font-black whitespace-nowrap">
              + 우산
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
