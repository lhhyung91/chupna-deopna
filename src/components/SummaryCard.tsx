import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, SKY_LABEL } from '@/lib/format';
import type { DayWeather } from '@/lib/weather';

type Props = { day: DayWeather; dayName: string };

// 벤토 그리드(6칸) 안에 "기온과 하늘" 4칸, "강수" 2칸으로 놓인다.
export function SummaryCard({ day, dayName }: Props) {
  return (
    <>
      <section
        aria-label={`${dayName} 기온과 하늘`}
        className="col-span-4 flex flex-col gap-1 card px-4 py-3.5"
      >
        <span className="text-xs text-muted">최저 / 최고</span>
        {/* 좁은 화면에서 기온이 길어지면 하늘 상태가 아래로 내려간다 */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="font-num text-2xl font-bold tracking-[-1px] whitespace-nowrap tabular-nums min-[360px]:text-[30px] min-[360px]:leading-[34px]">
            {formatTemp(day.min)} / {formatTemp(day.max)}
          </span>
          <span className="flex flex-col items-center">
            <WeatherIcon kind={day.sky} size={36} />
            <span className="text-[13px] font-bold">{SKY_LABEL[day.sky]}</span>
          </span>
        </div>
      </section>
      <section
        aria-label={`${dayName} 강수확률`}
        className="col-span-2 flex flex-col gap-1 card px-3 py-3.5"
      >
        <span className="text-xs text-muted">강수</span>
        <span className="font-num text-2xl font-bold tracking-[-1px] whitespace-nowrap tabular-nums min-[360px]:text-[30px] min-[360px]:leading-[34px]">
          {day.pop}%
        </span>
      </section>
    </>
  );
}
