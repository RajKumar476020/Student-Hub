import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Terminal Dark Theme
        bg: '#0A0A0F',
        'bg-elevated': '#111118',
        'bg-card': '#16161F',
        'bg-hover': '#1C1C28',
        border: '#2A2A3A',
        'border-bright': '#3A3A4F',
        'border-glow': '#00F5D4',
        fg: '#E8E8F0',
        'fg-muted': '#7A7A8A',
        'fg-subtle': '#4A4A5A',
        
        // Neon Accents
        cyan: '#00F5D4',
        'cyan-dim': '#00C5A8',
        'cyan-glow': 'rgba(0, 245, 212, 0.4)',
        magenta: '#FF006E',
        'magenta-dim': '#CC0058',
        'magenta-glow': 'rgba(255, 0, 110, 0.4)',
        green: '#39FF14',
        'green-dim': '#2ECC10',
        'green-glow': 'rgba(57, 255, 20, 0.4)',
        orange: '#FFB800',
        'orange-dim': '#E6A500',
        'orange-glow': 'rgba(255, 184, 0, 0.4)',
        purple: '#BC13FE',
        'purple-dim': '#9B10CC',
        'purple-glow': 'rgba(188, 19, 254, 0.4)',
        red: '#FF2D55',
        'red-dim': '#E6284A',
        'red-glow': 'rgba(255, 45, 85, 0.4)',
        
        // Semantic
        primary: '#00F5D4',
        'primary-hover': '#00C5A8',
        'primary-glow': 'rgba(0, 245, 212, 0.4)',
        secondary: '#FF006E',
        accent: '#39FF14',
        warning: '#FFB800',
        danger: '#FF2D55',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
        sans: ['var(--font-space)', 'Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 212, 0.3), 0 0 40px rgba(0, 245, 212, 0.15)',
        'glow-magenta': '0 0 20px rgba(255, 0, 110, 0.3), 0 0 40px rgba(255, 0, 110, 0.15)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.3), 0 0 40px rgba(57, 255, 20, 0.15)',
        'glow-purple': '0 0 20px rgba(188, 19, 254, 0.3), 0 0 40px rgba(188, 19, 254, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(58, 58, 79, 0.5)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 245, 212, 0.3), 0 0 20px rgba(0, 245, 212, 0.1)',
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'typewriter': 'typewriter 3s steps(40) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.85' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 4px' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '80px 80px' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        blink: {
          '0%, 50%': { borderColor: '#00F5D4' },
          '51%, 100%': { borderColor: 'transparent' },
        },
      },
      backgroundImage: {
        'grid-cyan': 'linear-gradient(rgba(0, 245, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 212, 0.03) 1px, transparent 1px)',
        'grid-cyan-lg': 'linear-gradient(rgba(0, 245, 212, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 212, 0.02) 1px, transparent 1px)',
        'scanlines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.08) 2px, rgba(0, 0, 0, 0.08) 4px)',
        'gradient-cyan': 'linear-gradient(135deg, #00F5D4 0%, #00C5A8 100%)',
        'gradient-magenta': 'linear-gradient(135deg, #FF006E 0%, #CC0058 100%)',
        'gradient-green': 'linear-gradient(135deg, #39FF14 0%, #2ECC10 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00F5D4 0%, #39FF14 50%, #FF006E 100%)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
        'grid-80': '80px 80px',
      },
    },
  },
  plugins: [],
}

export default config