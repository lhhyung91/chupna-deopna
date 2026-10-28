import { ClothingIcon } from '@/components/ClothingIcon';
import type { ClothingItem } from '@/lib/outfit';

type Props = { title: string; basis: string; items: ClothingItem[] };

export function OutfitCard({ title, basis, items }: Props) {
  return (
    <section
      aria-label="옷차림 추천"
      className="flex flex-col gap-4 rounded-3xl p-5 shadow-neu"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-link">{title}</h2>
        <span className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-muted inset-shadow-neu-chip">
          {basis}
        </span>
      </div>
      {/* 아래 조합 문구가 같은 순서로 이름을 알려주므로 그림 밑 이름은 반복하지 않는다 */}
      <div aria-hidden="true" className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex h-[92px] items-center justify-center rounded-3xl inset-shadow-neu"
          >
            <ClothingIcon kind={item.kind} size={76} />
          </div>
        ))}
      </div>
      <p className="text-2xl font-black tracking-tight break-keep">
        {items.map((item) => item.label).join(' + ')}
      </p>
    </section>
  );
}
