import { ClothingIcon } from '@/components/ClothingIcon';
import { WeatherIcon } from '@/components/WeatherIcon';
import type { Banner, BannerKind } from '@/lib/outfit';

const COLORS: Record<BannerKind, string> = {
  tempGap: 'bg-gap-bg text-gap-ink',
  umbrella: 'bg-umbrella-bg text-umbrella-ink',
  snow: 'bg-snow-bg text-snow-ink',
  wind: 'bg-wind-bg text-wind-ink',
};

export function BannerList({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <ul className="flex flex-col gap-3">
      {banners.map(({ kind, title, text }) => (
        <li
          key={kind}
          className={`flex items-center gap-3 rounded-2xl p-4 shadow-neu-sm ${COLORS[kind]}`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-white/10">
            {/* 겉옷 전용 아이콘이 없어서 자켓 일러스트로 대신한다 */}
            {kind === 'tempGap' ? (
              <ClothingIcon kind="zip_jacket" size={32} />
            ) : (
              <WeatherIcon kind={kind} size={32} />
            )}
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
