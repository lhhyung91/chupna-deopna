import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { HourlyItem } from '@/lib/weather';

type Props = { hourly: HourlyItem[]; highlightFirst: boolean };

export function HourlyForecast({ hourly, highlightFirst }: Props) {
  return (
    <section
      aria-label="시간대별 예보"
      className="col-span-6 flex flex-col gap-3 card pt-5 pb-3"
    >
      <h2 className="px-5 font-bold">시간대별</h2>
      {/* 스냅이 칸을 스크롤 영역 끝(여백 밖)에 붙이지 않도록 scroll-padding을 여백과 맞춘다 */}
      <ol className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto overscroll-x-contain px-5 pt-1 pb-2">
        {hourly.map((h, i) => {
          const isNow = i === 0 && highlightFirst;
          return (
            <li
              key={h.label}
              className={`flex h-28 w-14 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl ${isNow ? 'border-2 border-ink bg-ink text-bg' : ''}`}
            >
              <span
                className={`text-xs ${isNow ? 'font-bold' : 'font-medium'}`}
              >
                {h.label}
              </span>
              <WeatherIcon kind={h.sky} size={32} />
              <span className="font-num font-bold tabular-nums">
                {formatTemp(h.temp)}
              </span>
              {/* "지금" 칸은 바탕이 반전되므로 강수 글자도 반전색으로 */}
              <span
                className={`text-xs tabular-nums ${isNow ? '' : h.pop > 0 ? 'text-pop' : 'text-muted'}`}
              >
                {h.pop}%
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
