import { ClothingIcon } from '@/components/ClothingIcon';
import { WeatherIcon } from '@/components/WeatherIcon';
import type { ClothingItem } from '@/lib/outfit';

type Props = {
  title: string;
  basis: string;
  items: ClothingItem[];
  umbrella: boolean;
};

export function OutfitCard({ title, basis, items, umbrella }: Props) {
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="rounded-lg bg-ink px-2.5 py-0.5 font-display text-base/5.5 text-bg">
          {title}
        </h2>
        <span className="text-xs font-bold whitespace-nowrap text-muted">
          {basis}
        </span>
      </div>
      {/* 그림 아래 이름이 보이니 스크린리더엔 조합 한 문장만 읽힌다 */}
      <p className="sr-only">추천 옷차림: {combo.join(' + ')}</p>
      <div
        aria-hidden="true"
        className={`grid ${wide ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3'}`}
      >
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5">
            <div className={`${tile} tile-ground`}>
              <ClothingIcon kind={item.kind} size={wide ? 56 : 76} priority />
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
              <WeatherIcon kind="umbrella" size={56} />
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
