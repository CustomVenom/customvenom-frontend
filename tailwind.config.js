import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: 'class',
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
				},
				accent: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
				},
				success: '#16a34a',
				warn: '#f59e0b',
				danger: '#ef4444',
			},
			borderRadius: {
				lg: '0.5rem',
				xl: '0.75rem',
			},
			boxShadow: {
				card: '0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.1)',
			},
			spacing: {
				18: '4.5rem',
			},
		},
	},
	plugins: [forms, typography],
};

export default config;

