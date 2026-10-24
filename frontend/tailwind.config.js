/** Every colour reads from a CSS variable (src/styles/index.css), so dark/light themes just work. */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Components build class names like `bg-${tone}`; Tailwind can't see those, so list them here.
  safelist: [{ pattern: /^(bg|text|stroke|fill|border)-(primary|accent|success|warning|danger)(\/(10|15|20|30))?$/ }],
  theme: {
    extend: {
      colors: {
        bg: c('bg'), surface: c('surface'), fg: c('fg'), muted: c('muted'), line: c('line'),
        primary: c('primary'), accent: c('accent'),
        success: c('success'), warning: c('warning'), danger: c('danger'),
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        dot: { '0%,80%,100%': { transform: 'scale(.6)', opacity: .4 }, '40%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
        blink: 'blink 1s steps(2) infinite',
        dot: 'dot 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
