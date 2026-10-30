import Image from 'next/image';

type Props = { leaving?: boolean };

// 앱을 켤 때 덮는 로딩 화면. 첫 장면부터 이름·문구가 다 보여야 iOS 시작 화면 다음에 한 번에 나타난다
export function SplashScreen({ leaving = false }: Props) {
  return (
    <div
      data-splash-screen
      className={`fixed inset-0 z-50 bg-bg text-ink transition-opacity duration-500 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {/* 바탕은 화면 전체를 덮고, 내용은 앱이 실제로 쓰는 높이(--app-h) 안 가운데에 둔다 */}
      <div
        data-splash-frame
        className="absolute inset-x-0 top-0 flex flex-col items-center justify-center pb-18"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -mt-67.5 -ml-52.5 size-105 rounded-full splash-glow"
        />
        <div className="relative flex flex-col items-center">
          <div className="splash-glitch">
            <div className="size-52 splash-bob">
              {/* 이미 줄여 둔 WebP라 다시 변환하지 않는다 */}
              <Image
                src="/splash/cloud-light-512.webp"
                alt=""
                width={208}
                height={208}
                unoptimized
                priority
                className="size-52 dark:hidden"
              />
              <Image
                src="/splash/cloud-dark-512.webp"
                alt=""
                width={208}
                height={208}
                unoptimized
                priority
                className="hidden size-52 dark:block"
              />
            </div>
          </div>
          {/* 그림 아래 투명 여백만큼 끌어올려 구름 바로 밑에 둔다 */}
          <div
            aria-hidden="true"
            className="-mt-7.5 h-3 w-32 splash-floor rounded-full"
          />
          {/* 메인 화면 h1(동네 이름)과 겹쳐 있으므로 제목 태그를 쓰지 않는다 */}
          <p className="mt-7 font-display text-[2.5rem]/11 tracking-[-0.5px]">
            춥나덥나
          </p>
          <p className="mt-1.5 text-[0.9375rem]/5.5 font-medium text-muted">
            오늘 뭐 입지?
          </p>
        </div>
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-2.5"
        >
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
            <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
            <span className="size-1.5 splash-dot rounded-full bg-splash-dot" />
          </span>
          <span className="text-[0.8125rem]/4.5 font-medium text-muted">
            날씨 가져오는 중…
          </span>
        </div>
      </div>
    </div>
  );
}
