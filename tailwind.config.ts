import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0088CC",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#F8B500",
          foreground: "#333333",
        },
        accent: {
          DEFAULT: "#F8B500",
          foreground: "#333333",
        },
        dark: {
          DEFAULT: "#2C3E50",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        text: {
          DEFAULT: "#333333",
          light: "#666666",
        },
        page: {
          DEFAULT: "#F9FAFB",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      ringWidth: {
        '3': '3px',
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      gap: {
        '6': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
