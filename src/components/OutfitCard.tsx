import { ClothingIcon } from '@/components/ClothingIcon';
import type { ClothingItem } from '@/lib/outfit';

type Props = { title: string; basis: string; items: ClothingItem[] };

export function OutfitCard({ title, basis, items }: Props) {
  return (
    <section
      aria-label="옷차림 추천"
      className="flex flex-col gap-4 rounded-3xl p-5 shadow-neu"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-link">{title}</h2>
        <span className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-muted inset-shadow-neu-chip">
          {basis}
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex flex-col items-center gap-2">
            <div className="flex h-[92px] w-full items-center justify-center rounded-3xl inset-shadow-neu">
              <ClothingIcon kind={item.kind} size={76} />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-2xl font-black tracking-tight break-keep">
        {items.map((item) => item.label).join(' + ')}
      </p>
    </section>
  );
}
