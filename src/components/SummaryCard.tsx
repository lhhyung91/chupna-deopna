import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, SKY_LABEL } from '@/lib/format';
import type { DayWeather } from '@/lib/weather';

export function SummaryCard({ day }: { day: DayWeather }) {
  return (
    <section
      aria-label="요약"
      className="grid grid-cols-3 gap-3 rounded-3xl px-5 py-4 shadow-neu"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted">최저 / 최고</span>
        <span className="font-num text-xl font-semibold">
          {formatTemp(day.min)} / {formatTemp(day.max)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted">하늘</span>
        <span className="flex items-center gap-1 leading-7 font-bold">
          <WeatherIcon kind={day.sky} size={24} />
          {SKY_LABEL[day.sky]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted">강수확률</span>
        <span className="font-num text-xl font-semibold">{day.pop}%</span>
      </div>
    </section>
  );
}
