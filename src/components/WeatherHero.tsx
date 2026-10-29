import { BANNER_STYLES } from '@/components/BannerList';
import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, precipName, SKY_LABEL } from '@/lib/format';
import type { Banner } from '@/lib/outfit';
import type { DayWeather, NowWeather } from '@/lib/weather';

type Props = {
  now: NowWeather;
  day: DayWeather;
  isToday: boolean;
  wet?: Banner;
};

// 값 개수만큼 열을 고정해, 칸이 좁아져도 값이 다음 줄로 흩어지지 않게 한다
const STAT_COLUMNS = [
  '',
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-4',
];

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
    // 비 칸이 있으면 그쪽이 비 소식을 알려준다
    ...(wet ? [] : [[precipName(day.sky), `${day.pop}%`]]),
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
            className={`ml-auto font-num font-bold tracking-[-1px] whitespace-nowrap tabular-nums ${isToday ? 'text-4xl' : 'text-2xl'}`}
          >
            {isToday
              ? formatTemp(now.temp)
              : `${formatTemp(day.min)} / ${formatTemp(day.max)}`}
          </span>
        </div>
        {stats.length > 0 && (
          <dl className={`grid gap-x-2 ${STAT_COLUMNS[stats.length]}`}>
            {stats.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      {wet && (
        <div
          role="note"
          className={`flex items-center gap-2 rounded-[14px] border-[2.5px] border-ink p-2.5 text-on-bright shadow-hard ${BANNER_STYLES[wet.kind].bg}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white">
            <WeatherIcon kind={BANNER_STYLES[wet.kind].icon} size={32} />
          </span>
          {/* 사실만 두고("우산 챙겨요"는 옷 카드로), 우산은 "퇴근길 / 비 60%" 두 줄로 고정한다 */}
          <p className="flex min-w-0 flex-col text-sm font-bold whitespace-nowrap">
            {wet.kind === 'umbrella'
              ? wet.title
                  .split(/ (?=비)/)
                  .map((part) => <span key={part}>{part}</span>)
              : wet.title}
          </p>
        </div>
      )}
    </div>
  );
}
