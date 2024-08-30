import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
        addVariant('progress-unfilled', ['&::-webkit-progress-bar', '&']);
        addVariant('progress-filled', ['&::-webkit-progress-value', '&::-moz-progress-bar']);
    })
]
} satisfies Config

