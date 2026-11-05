/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        well: 'var(--well)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        pop: 'var(--pop)',
        chip: 'var(--chip)',
        'well-dark': 'var(--well-dark)',
        'well-light': 'var(--well-light)',
        skeleton: 'var(--skeleton)',
        'acc-tile': 'var(--acc-tile)',
        hint: 'var(--hint)',
        'hint-sub': 'var(--hint-sub)',
        'splash-dot': 'var(--splash-dot)',
        // 라이트·다크 공통으로 밝은 바탕이라 글자는 항상 검정
        point: '#ffa77a',
        'on-bright': '#111111',
        'delta-up': '#ffd43b',
        'delta-down': '#8cbcff',
      },
      // 앱에선 굵기마다 글꼴 이름이 달라서 font-bold 대신 굵기별 이름을 쓴다(_layout.tsx에서 불러옴)
      fontFamily: {
        sans: ['NotoSansKR_400Regular'],
        'sans-medium': ['NotoSansKR_500Medium'],
        'sans-bold': ['NotoSansKR_700Bold'],
        'sans-black': ['NotoSansKR_900Black'],
        display: ['BlackHanSans_400Regular'],
        num: ['SpaceGrotesk_500Medium'],
        'num-bold': ['SpaceGrotesk_700Bold'],
      },
    },
  },
  plugins: [],
};
