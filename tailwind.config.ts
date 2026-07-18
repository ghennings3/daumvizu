import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superfícies (dark theme como padrão)
        background: "#0B0E14",
        surface: "#111623",
        "surface-hover": "#161C2C",
        border: "#1F2534",

        // Texto
        foreground: "#E6E8EC",
        muted: "#8B93A7",

        // Acento verde-menta (placeholder — trocar pela referência exata das telas)
        accent: {
          DEFAULT: "#3ECF8E",
          hover: "#34B87C",
          muted: "#5EEAD4",
          foreground: "#04140D",
        },

        // Status de propostas
        status: {
          draft: "#8B93A7",
          sent: "#60A5FA",
          viewed: "#60A5FA",
          negotiation: "#FBBF24",
          accepted: "#3ECF8E",
          rejected: "#F87171",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "1rem",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
