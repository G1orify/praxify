/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#00ff00',
          secondary: '#00a2ff',
          accent: '#ff0055',
          warning: '#ffaa00',
          error: '#ff3333',
          success: '#00ff88',
        },
        // Background colors
        bg: {
          primary: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#121212',
          card: '#050505',
          glass: 'rgba(10, 10, 10, 0.8)',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          tertiary: '#606060',
          muted: '#404040',
          inverse: '#000000',
        },
        // Border colors
        border: {
          primary: '#1a1a1a',
          secondary: '#2a2a2a',
          glow: 'rgba(0, 255, 0, 0.3)',
          brand: '#00ff00',
        },
      },
      fontFamily: {
        mono: ['Share Tech Mono', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'glitch': 'glitch 4s infinite linear alternate-reverse',
        'scan': 'scan 8s linear infinite',
        'stream': 'stream 20s linear infinite',
        'spin': 'spin 0.6s linear infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'blink': 'blink 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'skew(0deg)' },
          '20%': { transform: 'skew(0deg)' },
          '21%': { transform: 'skew(1deg)' },
          '22%': { transform: 'skew(-1deg)' },
          '23%': { transform: 'skew(0deg)' },
        },
        scan: {
          '0%': { top: '0', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        stream: {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '0 100px, 100px 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(0, 255, 0, 0.3)',
        'glow-red': '0 0 40px rgba(255, 0, 85, 0.3)',
        'glow-blue': '0 0 40px rgba(0, 162, 255, 0.3)',
        'inner-glow': 'inset 0 0 30px rgba(0, 255, 0, 0.1)',
      },
      backgroundImage: {
        'grid-overlay': "linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)",
        'data-stream': "repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(0, 255, 0, 0.02) 0px, transparent 1px, transparent 2px)",
        'skeleton': "linear-gradient(90deg, #0a0a0a 25%, #121212 50%, #0a0a0a 75%)",
      },
      backgroundSize: {
        '50': '50px 50px',
      },
    },
  },
  plugins: [],
}
