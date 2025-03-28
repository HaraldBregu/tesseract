/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./src/renderer/src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#0625AC',
					foreground: '#D9E2FF',
					95: '#D9E2FF',
					90: '#A9BFFF',
					80: '#88A8FF',
					70: '#425FCC',
					60: '#2547B3',
					50: '#0625AC',
					40: '#001F85',
					30: '#001A72',
					20: '#001450',
					10: '#000A30'
				},
				secondary: {
					DEFAULT: '#455B71',
					foreground: '#E1EAF3',
					95: '#E1EAF3',
					90: '#C1D3E6',
					80: '#A4BBCF',
					70: '#7A94AB',
					60: '#5E7A92',
					50: '#455B71',
					40: '#2E3D4F',
					30: '#1A2835',
					20: '#101A25',
					10: '#060E15'
				},
				grey: {
					DEFAULT: '#A3A3A3',
					95: '#FAFAFA',
					90: '#F5F5F5',
					80: '#E5E5E5',
					70: '#D4D4D4',
					65: '#D9DADB',
					60: '#A3A3A3',
					50: '#737373',
					40: '#525252',
					30: '#404040',
					20: '#262626',
					10: '#1A1A1A'
				},
				destructive: {
					DEFAULT: '#CC334D',
					foreground: '#FBEFF1',
					95: '#FBEFF1',
					90: '#F5D6DB',
					80: '#EDADB8',
					70: '#E08593',
					60: '#D65C70',
					50: '#CC334D',
					40: '#B32D43',
					30: '#992639',
					20: '#7A1F2E',
					10: '#661A26'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: 0
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: 0
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [import("tailwindcss-animate")],
}