import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp } from '@/lib/format';
import type { CommuteWeather } from '@/lib/weather';

type Props = { commutes: CommuteWeather[]; focus: number | null };

// 벤토 그리드(6칸) 안의 출근·퇴근 칸. 지금 다가오는 쪽(focus)은 4칸, 다른 쪽은 2칸으로 줄여 쌓는다.
// 출근은 늘 왼쪽이라 폭만 바뀌고 자리는 그대로다. focus가 없으면 반반.
export function CommuteCards({ commutes, focus }: Props) {
  return commutes.map((c, i) => {
    const small = focus !== null && focus !== i;
    const span =
      focus === null ? 'col-span-3' : small ? 'col-span-2' : 'col-span-4';

    if (small) {
      return (
        <section
          key={c.label}
          aria-label={`${c.label} 날씨`}
          className={`${span} flex flex-col gap-1.5 card p-3`}
        >
          <div className="flex flex-col">
            <span className="font-bold">{c.label}</span>
            <span className="text-xs text-muted">{c.time}</span>
          </div>
          {/* 320px에선 2칸이 좁아 기온이 아이콘 아래로 내려간다 */}
          <div className="flex flex-wrap items-center gap-x-1">
            <WeatherIcon kind={c.sky} size={32} />
            <span className="font-num text-2xl font-bold tracking-[-1px] tabular-nums">
              {formatTemp(c.temp)}
            </span>
          </div>
          <span className={`text-xs ${c.pop > 0 ? 'text-pop' : 'text-muted'}`}>
            강수 {c.pop}%
          </span>
        </section>
      );
    }

    return (
      <section
        key={c.label}
        aria-label={`${c.label} 날씨`}
        className={`${span} flex flex-col gap-2 card p-4`}
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
    );
  });
}
