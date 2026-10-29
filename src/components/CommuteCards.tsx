import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { CommuteWeather } from '@/lib/weather';

type Props = { commutes: CommuteWeather[]; focus: number | null };

// 다가오는 쪽(focus)을 5:4로 넓히고 자리는 고정한다. 6칸 그리드로는 4:2밖에 안 돼서 이 줄만 따로 나눈다.
const COLUMNS = {
  0: 'grid-cols-[6fr_4fr]',
  1: 'grid-cols-[4fr_6fr]',
  none: 'grid-cols-2',
};

// 체감은 옷차림·날씨 칸에 있어 뺀다. 두 칸 내용 크기는 같고 폭만 다르다.
export function CommuteCards({ commutes, focus }: Props) {
  const columns = focus === 0 || focus === 1 ? COLUMNS[focus] : COLUMNS.none;

  return (
    <div className={`col-span-6 grid gap-3 ${columns}`}>
      {commutes.map((c) => (
        <section
          key={c.label}
          aria-label={`${c.label} 날씨`}
          className="flex flex-col justify-between gap-2 card p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-1">
            <span className="font-bold">{c.label}</span>
            <span className="text-xs whitespace-nowrap text-muted">
              {c.time}
            </span>
          </div>
          {/* 좁은 칸에서 기온이 길면 아이콘 아래로 내려간다 */}
          <div className="flex flex-wrap items-center gap-x-1.5">
            <WeatherIcon kind={c.sky} size={44} />
            <span className="font-num text-4xl leading-none font-bold tracking-[-2px] tabular-nums">
              {formatTemp(c.temp)}
            </span>
          </div>
          <span className={`text-sm ${c.pop > 0 ? 'text-pop' : 'text-muted'}`}>
            강수 {c.pop}%
          </span>
        </section>
      ))}
    </div>
  );
}
