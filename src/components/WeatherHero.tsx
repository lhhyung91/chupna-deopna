import { BANNER_STYLES } from '@/components/BannerList';
import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, precipName, SKY_LABEL } from '@/lib/format';
import type { Banner } from '@/lib/outfit';
import type { DayWeather, NowWeather } from '@/lib/weather';

type Props = {
  now: NowWeather;
  day: DayWeather;
  isToday: boolean;
  // 출퇴근길 비·눈 소식. 있으면 옆 칸을 그 색으로 칠하고 할 일을 붙인다
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

// 벤토 그리드 안의 날씨 줄. 날씨 6 : 출근 → 퇴근 4로 나란히 둔다.
export function WeatherHero({ now, day, isToday, wet }: Props) {
  const sky = isToday ? now.sky : day.sky;
  const [morning, evening] = day.commutes;
  // 내일은 지금 기온이 없어 큰 숫자 대신 최저·최고를 값 칸에 둔다(6칸 폭에 "구름 많음"과 "9° / 18°"가 같이 안 들어감)
  const stats = [
    ...(isToday ? [['체감', formatTemp(now.feel)]] : []),
    ['최저', formatTemp(day.min)],
    ['최고', formatTemp(day.max)],
    // 옆 칸이 비·눈 소식을 알려주면 여기선 뺀다
    ...(wet ? [] : [[precipName(day.sky), `${day.pop}%`]]),
  ];

  return (
    // 6칸 그리드로는 4:2밖에 안 돼서 6:4는 이 줄만 따로 나눈다
    <div className="col-span-6 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
      <section
        aria-label={isToday ? '지금 날씨' : '내일 날씨'}
        className="flex flex-col justify-center gap-2 card px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <WeatherIcon kind={sky} size={36} />
          <p className="flex flex-col">
            <span className="text-xs font-bold text-muted">
              {isToday ? '지금' : '내일'}
            </span>
            <span className="font-bold whitespace-nowrap">
              {SKY_LABEL[sky]}
            </span>
          </p>
          {isToday && (
            <span className="ml-auto font-num text-4xl font-bold tracking-[-1px] whitespace-nowrap tabular-nums">
              {formatTemp(now.temp)}
            </span>
          )}
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
      {/* 일교차 배너("아침 6° → 낮 17°")와 같은 꼴. 375px 안쪽 약 100px라 출근·퇴근을 두 줄로 나눈다 */}
      <section
        aria-label="출퇴근 기온"
        className={`flex flex-col justify-center gap-2 rounded-[14px] border-[2.5px] border-ink p-3 shadow-hard ${wet ? `text-on-bright ${BANNER_STYLES[wet.kind].bg}` : 'bg-card'}`}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white">
          <WeatherIcon
            kind={wet ? BANNER_STYLES[wet.kind].icon : evening.sky}
            size={32}
          />
        </span>
        <div className="break-keep">
          <p className="flex flex-col font-bold whitespace-nowrap tabular-nums">
            <span>
              {morning.label} {formatTemp(morning.temp)}
            </span>
            <span>
              → {evening.label} {formatTemp(evening.temp)}
            </span>
          </p>
          {/* 우산 아이콘이 할 일을 말해서, 글은 언제·얼마나("퇴근길 비 60%")만. "비 60%"는 붙여서 줄을 바꾼다 */}
          {wet && (
            <p className="text-sm">
              {wet.title.replace(/ (?=\S+$)/, '\u00a0')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
