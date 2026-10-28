import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { CommuteWeather } from '@/lib/weather';

// 벤토 그리드(6칸) 안에 출근·퇴근 반 칸씩 놓인다.
export function CommuteCards({ commutes }: { commutes: CommuteWeather[] }) {
  return commutes.map((c) => (
    <section
      key={c.label}
      aria-label={`${c.label} 날씨`}
      className="col-span-3 flex flex-col gap-2 card p-4"
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-bold">{c.label}</span>
        <span className="text-xs text-muted">{c.time}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <WeatherIcon kind={c.sky} size={44} />
        {/* 320px 폰에서 두 칸에 기온이 넘치지 않도록 한 단계 줄인다 */}
        <span className="font-num text-4xl leading-none font-bold tracking-[-2px] tabular-nums min-[360px]:text-[44px]">
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
  ));
}
