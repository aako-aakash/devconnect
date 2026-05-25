/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        surface: { 50:'#f8fafc', 100:'#f1f5f9', DEFAULT:'#0f172a', 900:'#0f172a', 800:'#1e293b', 700:'#334155', 600:'#475569' },
        accent:  { DEFAULT:'#6366f1', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' },
      },
    },
  },
  plugins: [],
}
