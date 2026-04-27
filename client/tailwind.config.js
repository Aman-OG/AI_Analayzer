/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            },
            scale: {
                '102': '1.02',
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'rotate-180': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(180deg)' },
                },
            },
            animation: {
                'slide-up-fast': 'slide-up 0.15s ease-out forwards',
                'slide-up-normal': 'slide-up 0.35s ease-out forwards',
                'slide-up-slow': 'slide-up 0.6s ease-out forwards',
                'fade-in-fast': 'fade-in 0.15s ease-out forwards',
                'fade-in-normal': 'fade-in 0.35s ease-out forwards',
                'fade-in-slow': 'fade-in 0.6s ease-out forwards',
                'scale-in-fast': 'scale-in 0.15s ease-out forwards',
                'scale-in-normal': 'scale-in 0.35s ease-out forwards',
                'scale-in-slow': 'scale-in 0.6s ease-out forwards',
                'shimmer': 'shimmer 2s infinite',
                'rotate-180-fast': 'rotate-180 0.15s ease-out forwards',
                'rotate-180-normal': 'rotate-180 0.35s ease-out forwards',
                'rotate-180-slow': 'rotate-180 0.6s ease-out forwards',
            },

            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            boxShadow: {
                'shadow-sm-blue': '0 1px 2px rgba(59, 130, 246, 0.1)',
                'shadow-md-blue': '0 4px 6px rgba(59, 130, 246, 0.15)',
                'shadow-lg-blue': '0 10px 15px rgba(59, 130, 246, 0.2)',
                'shadow-xl-blue': '0 20px 25px rgba(59, 130, 246, 0.25)',
                'shadow-2xl-blue': '0 25px 50px rgba(59, 130, 246, 0.3)',
            },
        },
    },
    plugins: [
        plugin(function({ addUtilities }) {
            const staggerAnimations = {
                '.animate-stagger-1': { animationDelay: '0ms' },
                '.animate-stagger-2': { animationDelay: '100ms' },
                '.animate-stagger-3': { animationDelay: '200ms' },
                '.animate-stagger-4': { animationDelay: '300ms' },
                '.animate-stagger-5': { animationDelay: '400ms' },
            };
            addUtilities(staggerAnimations);

            const glassmorphismUtilities = {
                '.glass': {
                    '@apply backdrop-blur-md bg-white/10 border border-white/20 rounded-lg': {},
                },
                '.glass-dark': {
                    '@apply backdrop-blur-md bg-black/10 border border-white/5 rounded-lg': {},
                },
                '.glass-sm': {
                    '@apply backdrop-blur-sm bg-white/5 border border-white/10 rounded-md': {},
                },
                '.glass-lg': {
                    '@apply backdrop-blur-lg bg-white/20 border border-white/30 rounded-xl': {},
                },
            };
            addUtilities(glassmorphismUtilities);

            const shadowScaleUtilities = {
                '.shadow-scale-sm': { boxShadow: '0 1px 2px rgba(59, 130, 246, 0.1)' },
                '.shadow-scale-md': { boxShadow: '0 4px 6px rgba(59, 130, 246, 0.15)' },
                '.shadow-scale-lg': { boxShadow: '0 10px 15px rgba(59, 130, 246, 0.2)' },
                '.shadow-scale-xl': { boxShadow: '0 20px 25px rgba(59, 130, 246, 0.25)' },
                '.shadow-scale-2xl': { boxShadow: '0 25px 50px rgba(59, 130, 246, 0.3)' },
            };
            addUtilities(shadowScaleUtilities);
        }),
    ],
}
