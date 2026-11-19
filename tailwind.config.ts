import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: '#173b33',
        sage: '#dce8dc',
        lime: '#d7ef71',
        cream: '#f6f5ef',
        ink: '#17251f',
        muted: '#718079',
      },
      boxShadow: {
        card: '0 12px 35px rgba(27, 54, 45, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
