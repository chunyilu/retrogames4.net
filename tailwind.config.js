module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff007f',
          cyan: '#00f3ff',
          purple: '#9d00ff',
          yellow: '#ffe600',
          dark: '#0a0a12',
          card: '#121225'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier New', 'monospace']
      }
    }
  },
  plugins: [],
}