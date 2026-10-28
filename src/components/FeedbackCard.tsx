import { WeatherIcon } from '@/components/WeatherIcon';
import type { Feeling } from '@/hooks/useFeedback';

const OPTIONS: { id: Feeling; label: string }[] = [
  { id: 'hot', label: '더웠어요' },
  { id: 'good', label: '괜찮았어요' },
  { id: 'cold', label: '추웠어요' },
];

type Props = {
  feeling: Feeling | null;
  offset: number;
  onSelect: (feeling: Feeling) => void;
};

export function FeedbackCard({ feeling, offset, onSelect }: Props) {
  return (
    <section
      aria-label="옷차림 피드백"
      className="flex flex-col gap-4 rounded-3xl p-5 shadow-neu"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">
          {feeling ? '기록했어요' : '오늘 옷차림 어땠어요?'}
        </h2>
        {feeling && (
          <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-link inset-shadow-neu-chip">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
            저장됨
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ id, label }) => {
          const pressed = feeling === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={pressed}
              onClick={() => onSelect(id)}
              className={`flex h-[88px] flex-col items-center justify-center gap-1 rounded-2xl text-sm font-bold ${pressed ? 'bg-point text-on-point inset-shadow-point' : 'shadow-neu-sm'}`}
            >
              <WeatherIcon kind={id} size={44} />
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col text-xs text-muted">
        <span>
          {feeling
            ? '다른 버튼을 누르면 바꿀 수 있어요'
            : '내일 추천에 반영돼요'}
        </span>
        {offset > 0 && <span>추위를 타는 편으로 반영 중 (+{offset}°)</span>}
        {offset < 0 && <span>더위를 타는 편으로 반영 중 (−{-offset}°)</span>}
      </div>
    </section>
  );
}
