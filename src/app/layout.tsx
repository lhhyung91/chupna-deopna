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
  metadataBase: new URL('https://chupna-deopna.vercel.app'),
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
      className={`${noto.variable} ${blackHan.variable} ${grotesk.variable} antialiased`}
    >
      <body className="font-sans">
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
