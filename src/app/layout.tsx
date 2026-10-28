import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR, Outfit } from 'next/font/google';
import './globals.css';

// 한글 글리프는 subset으로 나눌 수 없어 preload를 끈다.
const notoSansKr = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  weight: ['400', '500', '700', '900'],
  preload: false,
});

const outfit = Outfit({
  variable: '--font-outfit',
  weight: ['500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '춥나덥나',
  description: '오늘 날씨와 옷차림을 한 화면에서',
  appleWebApp: { title: '춥나덥나', capable: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E3E8EF' },
    { media: '(prefers-color-scheme: dark)', color: '#262A33' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${outfit.variable} antialiased`}
    >
      <body className="font-sans">
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
