import { WeatherIcon, type WeatherIconKind } from '@/components/WeatherIcon';
import type { Banner, BannerKind } from '@/lib/outfit';

export const BANNER_STYLES: Record<
  BannerKind,
  { bg: string; icon: WeatherIconKind }
> = {
  tempGap: { bg: 'bg-banner-gap', icon: 'outer' },
  umbrella: { bg: 'bg-banner-umbrella', icon: 'umbrella' },
  snow: { bg: 'bg-banner-snow', icon: 'snow' },
  wind: { bg: 'bg-banner-wind', icon: 'wind' },
};

// 2개 이상이면 반 칸씩 나란히 두고, 홀수 개면 마지막 하나만 한 줄을 다 쓴다.
const isHalf = (index: number, count: number) =>
  count >= 2 && !(count % 2 === 1 && index === count - 1);

// 벤토 그리드(6칸) 안에 바로 놓이는 칸들을 반환한다.
export function BannerList({ banners }: { banners: Banner[] }) {
  return banners.map(({ kind, title, text }, i) => {
    const half = isHalf(i, banners.length);
    return (
      <div
        key={kind}
        role="note"
        className={`flex gap-3 rounded-[14px] border-[2.5px] border-ink px-4 text-on-bright shadow-hard ${BANNER_STYLES[kind].bg} ${half ? 'col-span-3 flex-col py-3.5' : 'col-span-6 items-center py-2.5'}`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white ${half ? 'size-12' : 'size-10'}`}
        >
          <WeatherIcon kind={BANNER_STYLES[kind].icon} size={32} />
        </span>
        {/* 한 줄 배너는 제목·문구를 이어 쓰고, 길면 문구가 덩어리째 아랫줄로 간다 */}
        <div
          className={`min-w-0 break-keep ${half ? '' : 'flex flex-wrap items-baseline gap-x-2'}`}
        >
          <p className={`font-bold ${half ? '' : 'whitespace-nowrap'}`}>
            {title}
          </p>
          <p className={`text-sm ${half ? '' : 'whitespace-nowrap'}`}>{text}</p>
        </div>
      </div>
    );
  });
}
