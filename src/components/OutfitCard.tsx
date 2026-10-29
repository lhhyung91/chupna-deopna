import { ClothingIcon } from '@/components/ClothingIcon';
import type { ClothingItem, EveningNote } from '@/lib/outfit';

type Props = {
  title: string;
  basis: string;
  items: ClothingItem[];
  eveningNote: EveningNote | null;
  tip?: string;
};

export function OutfitCard({ title, basis, items, eveningNote, tip }: Props) {
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
      {/* "+" 뒤를 줄바꿈 없는 공백으로 이어서, 줄이 바뀌어도 "+"가 줄 끝에 홀로 남지 않게 한다 */}
      <p className="font-display text-3xl text-balance break-keep">
        {items.map((item) => item.label).join(' + ')}
      </p>
      {(eveningNote || tip) && (
        <ul className="-mt-2 flex flex-col gap-0.5 text-sm break-keep text-muted">
          {eveningNote && (
            <li>
              <strong className="font-bold text-ink">
                {eveningNote.label}
              </strong>{' '}
              {eveningNote.text}
            </li>
          )}
          {tip && <li>{tip}</li>}
        </ul>
      )}
    </section>
  );
}
