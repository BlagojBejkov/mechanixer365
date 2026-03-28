/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mechanixer brand palette — precise, industrial, premium
        mx: {
          black:    '#0A0A0B',
          dark:     '#111114',
          surface:  '#16161A',
          muted:    '#1E1E24',
          border:   '#2A2A32',
          subtle:   '#3A3A45',
          mid:      '#6B6B7A',
          dim:      '#9494A3',
          light:    '#C8C8D4',
          white:    '#F0F0F5',
          // Accent — electric steel blue
          accent:   '#3D8EF0',
          'accent-dim': '#2B6DC4',
          'accent-glow': '#3D8EF020',
          // Status
          green:    '#22C55E',
          amber:    '#F59E0B',
          red:      '#EF4444',
          purple:   '#8B5CF6',
        },
      },
      fontFamily: {
        // Display: sharp, industrial
        display: ['var(--font-display)', 'system-ui'],
        // Body: clean, readable
        body: ['var(--font-body)', 'system-ui'],
        // Mono: for numbers, codes
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(61, 142, 240, 0.15)',
        'glow-sm': '0 0 10px rgba(61, 142, 240, 0.1)',
        'inner-border': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
