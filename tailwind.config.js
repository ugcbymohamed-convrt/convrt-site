/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a0b',
        'surface-1': '#131316',
        'surface-2': '#1c1c20',
        'surface-3': '#26262b',
        hairline: '#26262b',
        'hairline-strong': '#34343a',
        ink: '#fafafa',
        'ink-muted': '#a1a1aa',
        'ink-subtle': '#71717a',
        lime: '#d5ff40',
        'lime-dark': '#a3e600',
        'lime-light': '#e8ff7a',
        coral: '#ff6a4d',
        violet: '#8b5cf6',
        magenta: '#ec4899',
        amber: '#ffb547',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'display-xl': '-0.045em',
        display: '-0.03em',
        snug: '-0.015em',
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      },
      backgroundImage: {
        'spot-violet': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'spot-coral': 'linear-gradient(135deg, #ff6a4d 0%, #ffb547 100%)',
        'spot-lime': 'linear-gradient(135deg, #d5ff40 0%, #8fe600 100%)',
      },
    },
  },
  plugins: [],
}
