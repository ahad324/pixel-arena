/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': "linear-gradient(theme(colors.text.primary / 15%) 1px, transparent 1px), linear-gradient(90deg, theme(colors.text.primary / 15%) 1px, transparent 1px)",
      },
      colors: {
        background: 'hsl(var(--background-hsl) / <alpha-value>)',
        surface: {
          100: 'hsl(var(--surface-100-hsl) / <alpha-value>)',
          200: 'hsl(var(--surface-200-hsl) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary-hsl) / <alpha-value>)',
          hover: 'hsl(var(--primary-hover-hsl) / <alpha-value>)',
          dark: 'hsl(var(--primary-dark-hsl) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent-hsl) / <alpha-value>)',
          hover: 'hsl(var(--accent-hover-hsl) / <alpha-value>)',
          dark: 'hsl(var(--accent-dark-hsl) / <alpha-value>)',
          secondary: 'hsl(var(--accent-secondary-hsl) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'hsl(var(--error-hsl) / <alpha-value>)',
          hover: 'hsl(var(--error-hover-hsl) / <alpha-value>)',
          dark: 'hsl(var(--error-dark-hsl) / <alpha-value>)',
        },
        // Added highlight colors to Tailwind config for use in components.
        'it-highlight': 'hsl(var(--it-highlight-hsl) / <alpha-value>)',
        'seeker-highlight': 'hsl(var(--seeker-highlight-hsl) / <alpha-value>)',
        'infected-highlight': 'hsl(var(--infected-highlight-hsl) / <alpha-value>)',
        'reveal-highlight': 'hsl(var(--reveal-highlight-hsl) / <alpha-value>)',
        text: {
          primary: 'hsl(var(--text-primary-hsl) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary-hsl) / <alpha-value>)',
          'on-primary': 'hsl(var(--text-on-primary-hsl) / <alpha-value>)',
        },
        border: 'hsl(var(--border-hsl) / <alpha-value>)',
        warning: {
          DEFAULT: 'hsl(var(--warning-hsl) / <alpha-value>)',
          dark: 'hsl(var(--warning-dark-hsl) / <alpha-value>)',
        },
        info: 'hsl(var(--info-hsl) / <alpha-value>)',
        experimental: 'hsl(var(--experimental-hsl) / <alpha-value>)',
        grid: {
          wall: 'hsl(var(--grid-wall-hsl) / <alpha-value>)',
          path: 'hsl(var(--grid-path-hsl) / <alpha-value>)',
          border: 'hsl(var(--grid-border-hsl) / <alpha-value>)',
          start: 'hsl(var(--grid-start-hsl) / <alpha-value>)',
          end: 'hsl(var(--grid-end-hsl) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        subtleGlow: {
          '0%, 100%': {
            boxShadow: '0 0 8px 0px hsl(var(--primary-hsl) / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px 4px hsl(var(--primary-hsl) / 0.8)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        successPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'glow-soft': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'subtle-glow': 'subtleGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
        shake: 'shake 0.3s ease-in-out',
        'success-pop': 'successPop 0.4s ease-out',
        float: 'float 3s ease-in-out infinite',
        'glow-soft': 'glow-soft 2.5s ease-in-out infinite',
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
        spacing: 'margin, padding',
        colors:
          'color, background-color, border-color, text-decoration-color, fill, stroke',
        shadow: 'box-shadow',
        filter: 'filter',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};
