import type { Metadata, Viewport } from 'next';
import {
  Black_Han_Sans,
  Noto_Sans_KR,
  Space_Grotesk,
  Space_Mono,
} from 'next/font/google';
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

const spaceMono = Space_Mono({
  variable: '--font-spacemono',
  weight: '700',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '춥나덥나',
  description: '오늘 날씨와 옷차림을 한 화면에서',
  appleWebApp: { title: '춥나덥나', capable: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1EFE8' },
    { media: '(prefers-color-scheme: dark)', color: '#141413' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${noto.variable} ${blackHan.variable} ${grotesk.variable} ${spaceMono.variable} antialiased`}
    >
      <body className="font-sans">
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
