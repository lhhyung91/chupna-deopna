import { LEVELS, levelRange } from '@/lib/outfit';

type Props = { currentIndex: number; offset: number };

// 접고 펴는 상태는 브라우저 기본 details/summary에 맡긴다(키보드·스크린리더 지원 포함).
export function OutfitGuide({ currentIndex, offset }: Props) {
  return (
    <details className="group card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-5 font-bold [&::-webkit-details-marker]:hidden">
        기온별 옷차림
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="flex flex-col gap-3 px-5 pb-5">
        <ol className="flex flex-col gap-1">
          {LEVELS.map((level, i) => {
            const current = i === currentIndex;
            return (
              <li
                key={levelRange(i)}
                aria-current={current ? 'true' : undefined}
                className={`grid grid-cols-[4.5rem_1fr] gap-x-3 rounded-xl px-3 py-2 text-sm ${current ? 'border-2 border-ink bg-ink font-bold text-bg' : 'border-2 border-transparent'}`}
              >
                <span className="font-num font-bold tabular-nums">
                  {levelRange(i)}
                </span>
                <span className="break-keep">
                  {level.items.map((item) => item.label).join(' + ')}
                  {level.tip && (
                    <span
                      className={`block text-xs ${current ? '' : 'text-muted'}`}
                    >
                      {level.tip}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted">
          출퇴근 평균 체감온도 기준
          {offset > 0 && ` · 추위를 타는 편이라 ${offset}° 더 따뜻하게 추천 중`}
          {offset < 0 && ` · 더위를 타는 편이라 ${-offset}° 더 가볍게 추천 중`}
        </p>
      </div>
    </details>
  );
}
