import { WeatherIcon, type WeatherIconKind } from '@/components/WeatherIcon';
import type { Banner, BannerKind } from '@/lib/outfit';

const STYLES: Record<BannerKind, { bg: string; icon: WeatherIconKind }> = {
  tempGap: { bg: 'bg-banner-gap', icon: 'outer' },
  umbrella: { bg: 'bg-banner-umbrella', icon: 'umbrella' },
  snow: { bg: 'bg-banner-snow', icon: 'snow' },
  wind: { bg: 'bg-banner-wind', icon: 'wind' },
};

export function BannerList({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <ul className="flex flex-col gap-3">
      {banners.map(({ kind, title, text }) => (
        <li
          key={kind}
          className={`flex items-center gap-3 rounded-[14px] border-[2.5px] border-ink px-4 py-3.5 text-on-bright shadow-hard ${STYLES[kind].bg}`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-on-bright bg-white">
            <WeatherIcon kind={STYLES[kind].icon} size={32} />
          </span>
          <div className="min-w-0">
            <p className="font-bold">{title}</p>
            <p className="text-sm">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
