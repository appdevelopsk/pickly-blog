import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ダークモードはクラス名の一括書き換え(31ファイル)ではなく、
        // slate パレットの実体を CSS 変数にして globals.css で反転させる方式。
        // bg-white / text-slate-900 等はそのまま使い続けられる(2026-08-22)。
        white: "rgb(var(--c-white) / <alpha-value>)",
        // ライト/ダークで反転しない“本物の白”。emerald/赤/黒帯など
        // 固定色の面に載る文字に使う(text-white はダークで濃紺化するため)。
        pure: "rgb(255 255 255 / <alpha-value>)",
        slate: {
          50:  "rgb(var(--c-slate-50) / <alpha-value>)",
          100: "rgb(var(--c-slate-100) / <alpha-value>)",
          200: "rgb(var(--c-slate-200) / <alpha-value>)",
          300: "rgb(var(--c-slate-300) / <alpha-value>)",
          400: "rgb(var(--c-slate-400) / <alpha-value>)",
          500: "rgb(var(--c-slate-500) / <alpha-value>)",
          600: "rgb(var(--c-slate-600) / <alpha-value>)",
          700: "rgb(var(--c-slate-700) / <alpha-value>)",
          800: "rgb(var(--c-slate-800) / <alpha-value>)",
          900: "rgb(var(--c-slate-900) / <alpha-value>)",
          950: "rgb(var(--c-slate-950) / <alpha-value>)",
        },
        brand: {
          50:  "rgb(var(--c-brand-50) / <alpha-value>)",
          100: "rgb(var(--c-brand-100) / <alpha-value>)",
          200: "rgb(var(--c-brand-200) / <alpha-value>)",
          300: "rgb(var(--c-brand-300) / <alpha-value>)",
          400: "rgb(var(--c-brand-400) / <alpha-value>)",
          500: "rgb(var(--c-brand-500) / <alpha-value>)",
          600: "rgb(var(--c-brand-600) / <alpha-value>)",
          700: "rgb(var(--c-brand-700) / <alpha-value>)",
          800: "rgb(var(--c-brand-800) / <alpha-value>)",
          900: "rgb(var(--c-brand-900) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
