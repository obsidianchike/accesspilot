/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind which files to scan for class names
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/hooks/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // AccessPilot brand colors — Microsoft Fluent-inspired with accessibility focus
      colors: {
        pilot: {
          50:  '#eef4ff',
          100: '#d9e8ff',
          200: '#bcd4fe',
          300: '#8eb5fd',
          400: '#5a8df9',
          500: '#3366f4',   // Primary brand blue
          600: '#1f4de0',
          700: '#1a3dba',
          800: '#1b3497',
          900: '#1c2f78',
          950: '#141e4d',
        },
        // Severity colors — designed for WCAG AA contrast on white and dark bg
        critical: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d',
        },
        serious: {
          50:  '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        moderate: {
          50:  '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          900: '#713f12',
        },
        minor: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
      },
      // Google Fonts: DM Sans (body) + Syne (headings) — loaded in layout.js
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      // Animated gradient for the hero background
      backgroundImage: {
        'pilot-mesh': `
          radial-gradient(at 20% 20%, rgba(51,102,244,0.15) 0px, transparent 50%),
          radial-gradient(at 80% 10%, rgba(99,102,241,0.10) 0px, transparent 50%),
          radial-gradient(at 60% 80%, rgba(30,58,138,0.12) 0px, transparent 50%)
        `,
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'pulse-ring':  'pulseRing 2s ease-in-out infinite',
        'scan-line':   'scanLine 2s ease-in-out infinite',
        'agent-enter': 'agentEnter 0.4s ease forwards',
        'score-fill':  'scoreFill 1.2s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.6' },
          '50%':      { transform: 'scale(1.08)', opacity: '1'   },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)'  },
        },
        agentEnter: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'     },
        },
        scoreFill: {
          '0%':   { strokeDashoffset: '339.3' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
    },
  },
  plugins: [],
}
