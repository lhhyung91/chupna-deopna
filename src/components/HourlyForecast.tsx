import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { HourlyItem } from '@/lib/weather';

type Props = { hourly: HourlyItem[]; highlightFirst: boolean };

export function HourlyForecast({ hourly, highlightFirst }: Props) {
  return (
    <section
      aria-label="시간대별 예보"
      className="flex flex-col gap-3 rounded-3xl pt-5 pb-3 shadow-neu"
    >
      <h2 className="px-5 font-bold">시간대별</h2>
      <ol className="scrollbar-none flex gap-2 overflow-x-auto px-5 pt-1 pb-2">
        {hourly.map((h, i) => {
          const isNow = i === 0 && highlightFirst;
          return (
            <li
              key={h.label}
              className={`flex h-28 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl ${isNow ? 'inset-shadow-neu' : ''}`}
            >
              {/* "지금" 칸을 오목한 그림자만으로 구분하지 않도록 글자색·굵기도 바꾼다 */}
              <span
                className={`text-xs ${isNow ? 'font-bold text-link' : 'font-medium'}`}
              >
                {h.label}
              </span>
              <WeatherIcon kind={h.sky} size={32} />
              <span className="font-num font-semibold tabular-nums">
                {formatTemp(h.temp)}
              </span>
              <span
                className={`text-xs tabular-nums ${h.pop > 0 ? 'text-pop' : 'text-muted'}`}
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
