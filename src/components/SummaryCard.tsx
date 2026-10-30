import { WeatherIcon } from '@/components/WeatherIcon';
import { formatTemp, precipName, SKY_LABEL } from '@/lib/format';
import {
  compareMornings,
  getCommuteDelta,
  isRainy,
  type MorningCompare,
  type Take,
} from '@/lib/outfit';
import type { CommuteWeather, DayWeather, NowWeather } from '@/lib/weather';

type Props = {
  // 내일 탭엔 지금 기온이 없다
  now?: NowWeather;
  day: DayWeather;
  // 어제(내일 탭은 오늘) 출근 체감. 어제 앱을 안 열었으면 없다
  compare?: MorningCompare;
  note: string | null;
  take: Take;
  // 저녁 오늘 탭: 오늘 출퇴근을 돌아보는 말투로 쓴다
  past: boolean;
};

const formatDelta = (delta: number) =>
  delta > 0 ? `+${delta}°` : delta < 0 ? `−${-delta}°` : '0°';

// 3° 넘게 달라지면 색으로도 알리고, 비슷하면 칩 색으로 둔다
const deltaClass = (delta: number) =>
  delta >= 3
    ? 'bg-delta-up text-on-bright'
    : delta <= -3
      ? 'bg-delta-down text-on-bright'
      : 'bg-chip text-ink';

// 큰 숫자는 옷을 고른 체감이고, 기온과 비·눈 소식은 아래 작은 글씨로 둔다
function Commute({ commute, end }: { commute: CommuteWeather; end: boolean }) {
  return (
    <div className={`flex flex-col ${end ? 'items-end' : 'items-start'}`}>
      <span className="text-xs font-bold whitespace-nowrap text-muted">
        {commute.label} {commute.time}
      </span>
      <span className="flex items-center gap-1">
        <WeatherIcon kind={commute.sky} size={36} />
        <span className="font-num text-3xl font-bold tracking-[-1.5px] tabular-nums">
          {formatTemp(commute.feel)}
        </span>
      </span>
      <span className="text-xs font-bold whitespace-nowrap tabular-nums">
        체감
        {isRainy(commute) ? (
          <span className="text-pop">
            {' '}
            · {precipName(commute.sky)} {commute.pop}%
          </span>
        ) : (
          <span className="text-muted"> · 기온 {formatTemp(commute.temp)}</span>
        )}
      </span>
    </div>
  );
}

export function SummaryCard({ now, day, compare, note, take, past }: Props) {
  const sky = now?.sky ?? day.sky;
  const [morning, evening] = day.commutes;
  const { delta, text } = getCommuteDelta(morning, evening, past);
  const vsMorning = compare && compareMornings(compare, morning, past);

  return (
    <section
      aria-label={now ? '오늘 요약' : '내일 요약'}
      className="col-span-6 flex flex-col gap-2.5 card px-4 pt-3.5 pb-4"
    >
      <div className="flex items-center gap-2">
        <WeatherIcon kind={sky} size={44} />
        {now && (
          <span className="font-num text-4xl font-bold tracking-[-1px] whitespace-nowrap tabular-nums">
            {formatTemp(now.temp)}
          </span>
        )}
        <p className="flex shrink-0 flex-col">
          <span className="whitespace-nowrap">
            <span className="text-xs font-bold text-muted">
              {now ? '지금' : '내일'}
            </span>{' '}
            <span className="font-bold">{SKY_LABEL[sky]}</span>
          </span>
          {vsMorning && (
            <span className="text-xs whitespace-nowrap text-muted tabular-nums">
              <span aria-hidden="true">{vsMorning.text}</span>
              <span className="sr-only">{vsMorning.spoken}</span>
            </span>
          )}
          {note && <span className="text-xs text-muted">{note}</span>}
        </p>
        {/* 한 줄이 기본이고, 기온·하늘 글자가 길어 칸이 모자라면 "/" 뒤에서 두 줄로 내려간다 */}
        <p className="ml-auto text-right text-xs text-muted tabular-nums">
          <span className="whitespace-nowrap">
            최고 <b className="text-ink">{formatTemp(day.max)}</b> /
          </span>{' '}
          <span className="whitespace-nowrap">
            최저 <b className="text-ink">{formatTemp(day.min)}</b>
          </span>
        </p>
      </div>

      <p className="sr-only">
        {`${morning.label} ${morning.time} 체감 ${formatTemp(morning.feel)}, ${evening.label} ${evening.time} 체감 ${formatTemp(evening.feel)}, ${text}`}
      </p>
      <div
        aria-hidden="true"
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
      >
        <Commute commute={morning} end={false} />
        <div className="flex min-w-0 flex-col items-center gap-px">
          <span
            className={`rounded-full border-2 border-ink px-2.5 py-0.5 font-num text-[0.9375rem]/5 font-bold tabular-nums ${deltaClass(delta)}`}
          >
            {formatDelta(delta)}
          </span>
          <span className="relative flex h-3.5 w-full items-center">
            <span className="h-[2.5px] w-full bg-ink" />
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute -right-0.5 text-ink"
            >
              <path d="M3 2l6 5-6 5" />
            </svg>
          </span>
          <span className="text-[0.6875rem]/3.5 font-bold whitespace-nowrap text-muted">
            {text}
          </span>
        </div>
        <Commute commute={evening} end />
      </div>

      {/* 문구 길이와 상관없이 날마다 같은 높이로 둔다 */}
      <p className="flex min-h-16 flex-col justify-center gap-0.5 rounded-[0.875rem] border border-hint-line bg-hint px-3 py-2.5 break-keep shadow-hint">
        <b className="text-[0.9375rem]/5">{take[0]}</b>
        <span className="text-sm/5 font-medium text-hint-sub">{take[1]}</span>
      </p>
    </section>
  );
}
