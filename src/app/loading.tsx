import { Header } from '@/components/Header';

// 로딩 화면은 빌드 때 미리 만들어져서 날짜를 넣으면 빌드한 날짜로 고정된다.
export default function Loading() {
  return (
    <>
      <Header status="업데이트 중…" />
      <div aria-busy="true" className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeWidth="3"
              className="stroke-skeleton"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-link"
            />
          </svg>
          날씨 불러오는 중…
        </p>
        <div className="h-62 rounded-3xl bg-skeleton" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-40 rounded-3xl bg-skeleton" />
          <div className="h-40 rounded-3xl bg-skeleton" />
        </div>
        <div className="h-21 rounded-3xl bg-skeleton" />
        <div className="h-48 rounded-3xl bg-skeleton" />
      </div>
    </>
  );
}
