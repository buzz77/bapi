/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // 启用手动深色模式控制
  theme: {
    extend: {
      colors: {
        // 品牌主色：明亮琥珀黄 #FFD52A
        primary: {
          DEFAULT: '#FFD52A',
          50: '#FFFBE6',
          100: '#FFF1B8',
          200: '#FFE58F',
          300: '#FFD52A', // Main
          400: '#FFC107',
          500: '#FAAD14',
          600: '#D48806',
          700: '#AD6800', // Hover/Active 较深色
          800: '#874D00',
          900: '#613400',
        },
        // 现代中性色 (Slate) - 替代传统的纯灰
        surface: {
          light: '#F8FAFC', // 亮色背景极淡灰
          dark: '#0F172A',  // 深色背景深蓝灰
          card: '#FFFFFF',
          'card-dark': '#1E293B',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(255, 213, 42, 0.3)', // 品牌色发光
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
