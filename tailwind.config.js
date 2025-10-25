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
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/lib/**/*.{js,ts,jsx,tsx,mdx}',
		'./stories/**/*.{js,ts,jsx,tsx,mdx}',
		'./tests/**/*.{js,ts,jsx,tsx,mdx}',
	],
	safelist: [
		// Dynamic color classes
		'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500',
		'text-red-500', 'text-green-500', 'text-blue-500', 'text-yellow-500', 'text-purple-500',
		'border-red-500', 'border-green-500', 'border-blue-500', 'border-yellow-500', 'border-purple-500',

		// Dynamic grid classes
		'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
		'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6',

		// Dynamic spacing classes
		'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6',
		'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6',
		'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6',
		'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6',

		// Dynamic width/height classes
		'w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20', 'w-24',
		'h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24',

		// Dynamic opacity classes
		'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',

		// Custom Venom brand classes
		'bg-brand-primary', 'text-brand-primary', 'border-brand-primary',
		'bg-brand-accent', 'text-brand-accent', 'border-brand-accent',
		'bg-cv-primary', 'text-cv-primary', 'border-cv-primary',
		'bg-cv-accent', 'text-cv-accent', 'border-cv-accent',

		// Dark mode variants for safelist
		'dark:bg-red-500', 'dark:bg-green-500', 'dark:bg-blue-500',
		'dark:text-red-500', 'dark:text-green-500', 'dark:text-blue-500',
		'dark:border-red-500', 'dark:border-green-500', 'dark:border-blue-500',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: { '2xl': '72rem' }
		},
		extend: {
			colors: {
				brand: {
					primary: '#0E7C45',
					accent: '#A3D977',
					ink: '#0F172A',
					muted: '#6B7280',
				},
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
				xl: '10px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.1)',
				field: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
			},
			spacing: {
				18: '4.5rem',
			},
		},
	},
	plugins: [forms, typography],
};

export default config;

