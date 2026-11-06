/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // 웹(Tailwind 4)은 아무 숫자나 간격이 되지만 3은 표에 있는 것만 돼서, 웹에서 쓰는 값을 더한다
      spacing: {
        18: '4.5rem',
        19: '4.75rem',
        22: '5.5rem',
        23: '5.75rem',
      },
      lineHeight: {
        4.5: '1.125rem',
        5.5: '1.375rem',
      },
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
        'hint-line': 'var(--hint-line)',
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
