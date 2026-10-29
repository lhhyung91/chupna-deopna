import { ClothingIcon } from '@/components/ClothingIcon';
import type { ClothingItem } from '@/lib/outfit';

// lead는 굵게, text는 띄어쓰기 없이 바로 이어 붙인다
export type OutfitLine = { lead?: string; text: string };

type Props = {
  title: string;
  basis: string;
  items: ClothingItem[];
  lines: OutfitLine[];
};

export function OutfitCard({ title, basis, items, lines }: Props) {
  return (
    <section
      aria-label="옷차림 추천"
      className="col-span-6 flex flex-col gap-4 card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="rounded-lg bg-ink px-2.5 py-0.5 font-display text-base/5.5 text-bg">
          {title}
        </h2>
        <span className="shrink-0 rounded-full border-2 border-ink bg-chip px-3 py-0.5 text-xs">
          {basis}
        </span>
      </div>
      {/* 아래 조합 문구가 같은 순서로 이름을 알려주므로 그림 밑 이름은 반복하지 않는다 */}
      <div aria-hidden="true" className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex h-23 items-center justify-center rounded-2xl border-2 border-ink shadow-well tile-ground"
          >
            <ClothingIcon kind={item.kind} size={76} priority />
          </div>
        ))}
      </div>
      {/* 가장 긴 조합(바람막이 + 맨투맨 + 긴바지)도 375px 칸에 한 줄로 들어가는 크기. 좁은 폰은 rem 비율로 같이 줄어든다 */}
      <p className="font-display text-[1.625rem] whitespace-nowrap">
        {items.map((item) => item.label).join(' + ')}
      </p>
      {lines.length > 0 && (
        <ul className="-mt-2 flex flex-col gap-0.5 text-sm break-keep text-muted">
          {lines.map(({ lead, text }) => (
            <li key={text}>
              {lead && <strong className="font-bold text-ink">{lead}</strong>}
              {text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
