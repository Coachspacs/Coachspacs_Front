import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-primary-main)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-secondary-light)",
        },
        canvas: "var(--color-bg-default)",
        surface: "var(--color-surface)",
        ink: {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        line: "var(--color-border)",
        header: "var(--color-header-bg)",
        primary: {
          main: "var(--color-primary-main)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          light: "var(--color-secondary-light)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;
