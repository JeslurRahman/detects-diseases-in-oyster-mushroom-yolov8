/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette (light-theme literals; runtime theming handled via useAppTheme)
        primary: '#3E5D46',
        'primary-soft': '#6B8A72',
        background: '#F7F8F5',
        surface: '#FBFBF7',
        card: '#F1EFE6',
        healthy: '#5AA469',
        'green-mold': '#F5A623',
        'black-mold': '#9B2D2D',
        warning: '#F6C65B',
        ink: '#2E2E2E',
        muted: '#7C8477',
        border: '#E4E5DD',
      },
      fontFamily: {
        display: ['Quicksand_700Bold'],
        'display-semibold': ['Quicksand_600SemiBold'],
        'display-medium': ['Quicksand_500Medium'],
        sans: ['Nunito_400Regular'],
        'sans-semibold': ['Nunito_600SemiBold'],
        'sans-bold': ['Nunito_700Bold'],
      },
      borderRadius: {
        xl: '18px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
