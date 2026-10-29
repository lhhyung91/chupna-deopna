import { Header } from '@/components/Header';

// 로딩 화면은 빌드 때 미리 만들어져서 날짜를 넣으면 빌드한 날짜로 고정된다.
export default function Loading() {
  return (
    <>
      <Header action={<div className="size-11 rounded-2xl bg-skeleton" />} />
      {/* 칸 높이는 375px 실제 화면에 맞춰, 다 그려질 때 내용이 밀리지 않게 한다 */}
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="flex h-25 items-center justify-center gap-2 rounded-[18px] bg-skeleton text-sm text-muted">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="motion-safe:animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeWidth="3"
              className="stroke-bg"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-ink"
            />
          </svg>
          날씨 불러오는 중…
        </div>
        <div className="h-79 rounded-[18px] bg-skeleton" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-35 rounded-[18px] bg-skeleton" />
          <div className="h-35 rounded-[18px] bg-skeleton" />
        </div>
        <div className="h-49 rounded-[18px] bg-skeleton" />
      </div>
    </>
  );
}
