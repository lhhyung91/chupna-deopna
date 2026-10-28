import { WeatherIcon } from '@/components/WeatherIcon';
import type { Feeling } from '@/hooks/useFeedback';
import { haptic } from '@/lib/haptic';

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
      className="flex flex-col gap-4 card p-5"
    >
      <h2 className="text-lg font-bold">오늘 옷차림 어땠어요?</h2>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ id, label }) => {
          const pressed = feeling === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={pressed}
              onClick={() => {
                haptic();
                onSelect(id);
              }}
              // 선택은 색과 위치를 함께 바꾼다: 살구색 + 3px 눌림(각진 그림자가 사라짐)
              className={`flex h-22 tactile flex-col items-center justify-center gap-1 rounded-2xl border-2 border-ink text-[13px] font-bold min-[360px]:text-sm ${pressed ? 'translate-x-0.75 translate-y-0.75 bg-point text-on-bright shadow-picked motion-safe:animate-pop motion-reduce:translate-none' : 'bg-card text-ink shadow-btn'}`}
            >
              {/* key를 바꿔야 다시 선택할 때도 바운스가 처음부터 재생된다 */}
              <span
                key={pressed ? 'on' : 'off'}
                className={`block ${pressed ? 'motion-safe:animate-bounce3d' : ''}`}
              >
                {/* 몽실이는 가로로 넓은 구름이라 44px에선 표정이 작아서 키운다 */}
                <WeatherIcon kind={id} size={56} />
              </span>
              {label}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="flex flex-col text-xs text-muted">
        {feeling ? (
          <span className="flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-ink"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
            기록했어요. 다른 버튼을 누르면 바뀌어요
          </span>
        ) : (
          <span>내일 추천에 반영돼요</span>
        )}
        {offset > 0 && <span>추위를 타는 편으로 반영 중 (+{offset}°)</span>}
        {offset < 0 && <span>더위를 타는 편으로 반영 중 (−{-offset}°)</span>}
      </div>
    </section>
  );
}
