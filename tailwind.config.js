/** @type {import('tailwindcss').Config} */
export default {
    content: ['./resources/**/*.blade.php', './resources/**/*.js', './resources/**/*.jsx', './resources/**/*.ts', './resources/**/*.tsx'],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'var(--color-border)',
                input: 'var(--color-input)',
                ring: 'var(--color-ring)',
                background: {
                    DEFAULT: 'var(--color-background)',
                    foreground: 'var(--color-foreground)',
                },
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    foreground: 'var(--color-primary-foreground)',
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    foreground: 'var(--color-secondary-foreground)',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                muted: {
                    DEFAULT: 'var(--color-muted)',
                    foreground: 'var(--color-muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    foreground: 'var(--color-accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--color-destructive)',
                    foreground: 'var(--color-destructive-foreground)',
                },
                card: {
                    DEFAULT: 'var(--color-card)',
                    foreground: 'var(--color-card-foreground)',
                },
                popover: {
                    DEFAULT: 'var(--color-popover)',
                    foreground: 'var(--color-popover-foreground)',
                },
                success: {
                    DEFAULT: 'var(--color-success)',
                    foreground: 'var(--color-success-foreground)',
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
                warning: {
                    DEFAULT: 'var(--color-warning)',
                    foreground: 'var(--color-warning-foreground)',
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                error: {
                    DEFAULT: 'var(--color-error)',
                    foreground: 'var(--color-error-foreground)',
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    950: '#450a0a',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                // Chart colors
                chart: {
                    1: 'var(--color-chart-1)',
                    2: 'var(--color-chart-2)',
                    3: 'var(--color-chart-3)',
                    4: 'var(--color-chart-4)',
                    5: 'var(--color-chart-5)',
                },
                // Sidebar colors
                sidebar: {
                    DEFAULT: 'var(--color-sidebar)',
                    foreground: 'var(--color-sidebar-foreground)',
                    primary: 'var(--color-sidebar-primary)',
                    'primary-foreground': 'var(--color-sidebar-primary-foreground)',
                    accent: 'var(--color-sidebar-accent)',
                    'accent-foreground': 'var(--color-sidebar-accent-foreground)',
                    border: 'var(--color-sidebar-border)',
                    ring: 'var(--color-sidebar-ring)',
                },
                // Preserve cinema-themed colors from original
                cinema: {
                    red: '#e11d48', // For reserved/sold seats
                    gold: '#eab308', // For premium seats
                    blue: '#0891b2', // For available seats
                    purple: '#8b5cf6', // For accent elements
                    dark: '#0f172a', // For dark elements
                },
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
            },
            fontFamily: {
                sans: ['var(--font-sans)'],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: 0 },
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                },
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 5px 2px rgba(239, 68, 68, 0.3)' },
                    '50%': { boxShadow: '0 0 20px 5px rgba(239, 68, 68, 0.5)' },
                },
                'text-flicker': {
                    '0%, 100%': { opacity: 1 },
                    '41.99%': { opacity: 1 },
                    '42%': { opacity: 0.8 },
                    '43%': { opacity: 1 },
                    '47.99%': { opacity: 1 },
                    '48%': { opacity: 0.5 },
                    '49%': { opacity: 1 },
                },
                'pop-in': {
                    '0%': { transform: 'scale(0.9)', opacity: 0 },
                    '70%': { transform: 'scale(1.05)', opacity: 1 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
                'confetti-1': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-100vh) translateX(100vw) rotate(720deg)', opacity: 0 },
                },
                'confetti-2': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-100vh) translateX(-100vw) rotate(720deg)', opacity: 0 },
                },
                'confetti-3': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-80vh) translateX(50vw) rotate(720deg)', opacity: 0 },
                },
                'confetti-4': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-80vh) translateX(-50vw) rotate(720deg)', opacity: 0 },
                },
                'confetti-5': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-60vh) translateX(30vw) rotate(720deg)', opacity: 0 },
                },
                'confetti-6': {
                    '0%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    '100%': { transform: 'translateY(-60vh) translateX(-30vw) rotate(720deg)', opacity: 0 },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
                wiggle: 'wiggle 1s ease-in-out infinite',
                glow: 'glow 2s ease-in-out infinite',
                'text-flicker': 'text-flicker 4s linear infinite',
                'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'confetti-1': 'confetti-1 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
                'confetti-2': 'confetti-2 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
                'confetti-3': 'confetti-3 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
                'confetti-4': 'confetti-4 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
                'confetti-5': 'confetti-5 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
                'confetti-6': 'confetti-6 2s cubic-bezier(0, 0.5, 0.5, 1) forwards',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
