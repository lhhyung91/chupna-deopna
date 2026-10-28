import { WeatherIcon, type WeatherIconKind } from '@/components/WeatherIcon';
import type { Banner, BannerKind } from '@/lib/outfit';

const STYLES: Record<BannerKind, { bg: string; icon: WeatherIconKind }> = {
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
        className={`flex gap-3 rounded-[14px] border-[2.5px] border-ink px-4 py-3.5 text-on-bright shadow-hard ${STYLES[kind].bg} ${half ? 'col-span-3 flex-col' : 'col-span-6 items-center'}`}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white">
          <WeatherIcon kind={STYLES[kind].icon} size={32} />
        </span>
        <div className="min-w-0 break-keep">
          <p className="font-bold">{title}</p>
          <p className="text-sm">{text}</p>
        </div>
      </div>
    );
  });
}
