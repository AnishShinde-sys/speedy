/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./sidepanel.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          60: 'rgba(0, 0, 0, 0.6)',
          100: 'rgb(16, 163, 127)',
        },
        secondary: {
          60: 'rgba(255, 255, 255, 0.6)',
          100: 'rgb(255, 255, 255)',
        },
        tertiary: {
          60: 'rgba(255, 255, 255, 0.6)',
        },
        // Cluely Design System Colors
        'cluely-blue': '#195ecc',
        'cluely-blue-hover': '#1852af',
        'cluely-blue-active': '#1751ae',
        'cluely-surface': 'rgba(24, 23, 28, 0.8)',
        'cluely-surface-action': 'rgba(24, 23, 28, 0.6)',
        'cluely-bg': '#0b0c10',
      },
      boxShadow: {
        'pane': '0 0 0 1px rgba(207, 226, 255, 0.24), 0 -0.5px 0 0 rgba(255, 255, 255, 0.80)',
        'pane-action': '0 -1px 0 0 rgba(255, 255, 255, 0.30), 0 17px 5px 0 rgba(0, 0, 0, 0), 0 11px 4px 0 rgba(0, 0, 0, 0.01), 0 6px 4px 0 rgba(0, 0, 0, 0.05), 0 3px 3px 0 rgba(0, 0, 0, 0.09), 0 1px 1px 0 rgba(0, 0, 0, 0.10)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      }
    },
  },
  plugins: [],
}


