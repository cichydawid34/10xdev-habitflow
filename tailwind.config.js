/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a24',
          600: '#22222e',
          500: '#2a2a38',
        },
        // Purple-blue gradient colors
        primary: {
          300: '#c4b5fd', // Lighter purple
          400: '#a78bfa', // Light purple
          500: '#8b5cf6', // Purple
          600: '#7c3aed', // Deep purple
          700: '#6d28d9', // Darker purple
          800: '#5b21b6', // Very dark purple
          900: '#4c1d95', // Darkest purple
        },
        accent: {
          400: '#60a5fa', // Light blue
          500: '#3b82f6', // Blue
          600: '#2563eb', // Deep blue
        },
        // Streak fire colors
        streak: {
          400: '#fb923c', // Orange
          500: '#f97316', // Deep orange
          600: '#ea580c', // Fire
        },
        // Success green
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        }
      },
      backgroundImage: {
        // Main gradient backgrounds
        'gradient-dark': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        'gradient-border': 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'streak': '0 0 20px rgba(251, 146, 60, 0.5)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}
