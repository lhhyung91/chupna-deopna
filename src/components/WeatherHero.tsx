import { BANNER_STYLES } from '@/components/BannerList';
import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, SKY_LABEL } from '@/lib/format';
import type { Banner } from '@/lib/outfit';
import type { DayWeather, NowWeather } from '@/lib/weather';

type Props = {
  now: NowWeather;
  day: DayWeather;
  isToday: boolean;
  wet?: Banner;
};

// 벤토 그리드 안의 날씨 줄. 비·눈 소식이 있으면 날씨:비 6:4, 없으면 날씨가 한 줄을 다 쓴다.
export function WeatherHero({ now, day, isToday, wet }: Props) {
  const sky = isToday ? now.sky : day.sky;
  const stats = [
    ...(isToday
      ? [
          ['체감', formatTemp(now.feel)],
          ['최저', formatTemp(day.min)],
          ['최고', formatTemp(day.max)],
        ]
      : []),
    // 비 칸이 있으면 그쪽이 강수를 알려준다
    ...(wet ? [] : [['강수', `${day.pop}%`]]),
  ];

  return (
    // 6칸 그리드로는 4:2밖에 안 돼서 날씨:비 6:4는 이 줄만 따로 나눈다
    <div
      className={`col-span-6 grid gap-3 ${wet ? 'grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : 'grid-cols-1'}`}
    >
      <section
        aria-label={isToday ? '지금 날씨' : '내일 날씨'}
        className="flex flex-col justify-center gap-2 card px-4 py-3"
      >
        {/* 좁은 칸에서 온도가 길면 아래 줄로 내려간다 */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <WeatherIcon kind={sky} size={wet ? 36 : 44} />
          <p className="flex flex-col">
            <span className="text-xs font-bold text-muted">
              {isToday ? '지금' : '내일'}
            </span>
            <span className="font-bold break-keep">{SKY_LABEL[sky]}</span>
          </p>
          <span
            className={`ml-auto font-num font-bold tracking-[-1px] whitespace-nowrap tabular-nums ${isToday ? 'text-3xl min-[360px]:text-4xl' : 'text-2xl'}`}
          >
            {isToday
              ? formatTemp(now.temp)
              : `${formatTemp(day.min)} / ${formatTemp(day.max)}`}
          </span>
        </div>
        {stats.length > 0 && (
          <dl className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            {stats.map(([label, value]) => (
              <div key={label} className="flex gap-1">
                <dt className="text-muted">{label}</dt>
                <dd className="font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      {wet && (
        // 360px 미만에선 4할 칸이 좁아 아이콘을 글 위로 올린다
        <div
          role="note"
          className={`flex flex-col items-start gap-2 rounded-[14px] border-[2.5px] border-ink p-3 text-on-bright shadow-hard min-[360px]:flex-row min-[360px]:items-center ${BANNER_STYLES[wet.kind].bg}`}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white">
            <WeatherIcon kind={BANNER_STYLES[wet.kind].icon} size={32} />
          </span>
          <div className="min-w-0 break-keep">
            {/* 좁은 칸에서 "비 60%"가 갈라지지 않게 마지막 띄어쓰기를 줄바꿈 없는 공백으로 */}
            <p className="text-sm font-bold">
              {wet.title.replace(/ (?=\S+$)/, ' ')}
            </p>
            <p className="text-xs">{wet.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
