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
        {hourly.map((h, i) => (
          <li
            key={h.label}
            className={`flex h-28 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl ${i === 0 && highlightFirst ? 'inset-shadow-neu' : ''}`}
          >
            <span className="text-xs font-medium">{h.label}</span>
            <WeatherIcon kind={h.sky} size={32} />
            <span className="font-num font-semibold">{formatTemp(h.temp)}</span>
            <span
              className={`text-xs ${h.pop > 0 ? 'text-pop' : 'text-muted'}`}
            >
              {h.pop}%
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
