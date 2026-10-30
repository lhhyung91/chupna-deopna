import { SplashProvider } from '@/components/SplashGate';
import { SITE_URL } from '@/lib/config';
import {
  SPLASH_FULL_EVERY_MS,
  SPLASH_SHOWN_KEY,
  startupImages,
} from '@/lib/splash';
import type { Metadata, Viewport } from 'next';
import { Black_Han_Sans, Noto_Sans_KR, Space_Grotesk } from 'next/font/google';
import './globals.css';

// 한글 글리프는 subset으로 나눌 수 없어 preload를 끈다.
const noto = Noto_Sans_KR({
  variable: '--font-noto',
  weight: ['400', '500', '700', '900'],
  preload: false,
});

const blackHan = Black_Han_Sans({
  variable: '--font-blackhan',
  weight: '400',
  preload: false,
});

const grotesk = Space_Grotesk({
  variable: '--font-grotesk',
  weight: ['500', '700'],
  subsets: ['latin'],
});

const DESCRIPTION = '출근길 체감온도로 오늘 입을 옷을 골라줘요';

// 공유 미리보기 그림은 app/opengraph-image.jpg를 Next가 넣는다. 메신저가 읽으려면 절대 주소가 필요하다
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '춥나덥나',
  description: DESCRIPTION,
  openGraph: {
    title: '춥나덥나',
    description: DESCRIPTION,
    siteName: '춥나덥나',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  // 시작 그림이 없으면 iOS가 첫 화면이 그려질 때까지 빈 화면(다크에선 검정)을 보여준다
  appleWebApp: {
    title: '춥나덥나',
    capable: true,
    startupImage: startupImages,
  },
  // Next는 capable을 표준 이름(mobile-web-app-capable)으로만 내보내는데, iOS 시작 그림은 apple- 이름이 있어야 쓰인다
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1EFE8' },
    { media: '(prefers-color-scheme: dark)', color: '#141413' },
  ],
};

// 3시간 안에 다시 열면 저장된 화면(sw.js)이 바로 뜨므로, 첫 그림 전에 로딩 화면을 숨겨 잠깐 비치지 않게 한다
const SKIP_SPLASH = `try{var t=+localStorage.getItem('${SPLASH_SHOWN_KEY}');if(t&&Date.now()-t<${SPLASH_FULL_EVERY_MS})document.documentElement.dataset.splash='skip'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // 위 스크립트가 data-splash를 먼저 달아서, React가 서버 HTML과 다르다고 경고하지 않게 한다
    <html
      lang="ko"
      className={`${noto.variable} ${blackHan.variable} ${grotesk.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKIP_SPLASH }} />
      </head>
      <body className="font-sans">
        <SplashProvider>
          <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12 pb-8">
            {children}
          </main>
        </SplashProvider>
      </body>
    </html>
  );
}
