import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            colors: {
                // Brand: deep red / burgundy (primary)
                brand: {
                    50: token('brand-50'),
                    100: token('brand-100'),
                    200: token('brand-200'),
                    300: token('brand-300'),
                    400: token('brand-400'),
                    500: token('brand-500'),
                    600: token('brand-600'),
                    700: token('brand-700'),
                    800: token('brand-800'),
                    900: token('brand-900'),
                    DEFAULT: token('brand-600'),
                },
                // Accent: restrained yellow/gold (highlights, active states, key CTAs only)
                accent: {
                    100: token('accent-100'),
                    400: token('accent-400'),
                    500: token('accent-500'),
                    DEFAULT: token('accent-400'),
                },
                // Surfaces and text
                canvas: token('canvas'),
                surface: {
                    DEFAULT: token('surface'),
                    muted: token('surface-muted'),
                },
                ink: {
                    DEFAULT: token('ink'),
                    muted: token('ink-muted'),
                    subtle: token('ink-subtle'),
                },
                line: {
                    DEFAULT: token('line'),
                    strong: token('line-strong'),
                },
                // Semantic status
                success: {
                    50: token('success-50'),
                    600: token('success-600'),
                    700: token('success-700'),
                },
                warning: {
                    50: token('warning-50'),
                    600: token('warning-600'),
                    700: token('warning-700'),
                },
                danger: {
                    50: token('danger-50'),
                    600: token('danger-600'),
                    700: token('danger-700'),
                },
            },

            // Limited, intentional type scale (size / line-height / tracking)
            fontSize: {
                caption: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
                small: ['0.8125rem', { lineHeight: '1.25rem' }],
                body: ['0.9375rem', { lineHeight: '1.5rem' }],
                lead: ['1.0625rem', { lineHeight: '1.625rem' }],
                heading: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
                title: ['1.625rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
                metric: ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
            },

            borderRadius: {
                control: '0.75rem', // buttons, inputs
                card: '1rem', // cards, panels
                sheet: '1.25rem', // modals, bottom sheets
            },

            boxShadow: {
                card: '0 1px 2px rgb(var(--shadow) / 0.05), 0 1px 3px rgb(var(--shadow) / 0.04)',
                raised: '0 4px 12px rgb(var(--shadow) / 0.08)',
                overlay: '0 12px 32px rgb(var(--shadow) / 0.16)',
            },

            // Touch targets: 44px minimum
            minHeight: { control: '2.75rem' },
            minWidth: { control: '2.75rem' },

            maxWidth: { content: '80rem' },

            transitionDuration: {
                fast: '120ms',
                base: '180ms',
                slow: '220ms',
            },
            transitionTimingFunction: {
                standard: 'cubic-bezier(0.2, 0, 0, 1)',
            },

            keyframes: {
                'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.97)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 180ms cubic-bezier(0.2, 0, 0, 1)',
                'scale-in': 'scale-in 180ms cubic-bezier(0.2, 0, 0, 1)',
            },
        },
    },

    plugins: [forms],
};