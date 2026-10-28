import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { CommuteWeather } from '@/lib/weather';

export function CommuteCards({ commutes }: { commutes: CommuteWeather[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {commutes.map((c) => (
        <section
          key={c.label}
          aria-label={`${c.label} 날씨`}
          className="flex flex-col gap-2 rounded-3xl p-4 shadow-neu"
        >
          <div className="flex items-baseline justify-between gap-1">
            <span className="font-bold">{c.label}</span>
            <span className="text-xs text-muted">{c.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon kind={c.sky} size={40} />
            {/* 320px 폰에서 두 칸에 기온이 넘치지 않도록 한 단계 줄인다 */}
            <span className="font-num text-3xl font-medium min-[360px]:text-4xl">
              {formatTemp(c.temp)}
            </span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-bold">체감 {formatTemp(c.feel)}</span>
            <span className={c.pop > 0 ? 'text-pop' : 'text-muted'}>
              강수 {c.pop}%
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
