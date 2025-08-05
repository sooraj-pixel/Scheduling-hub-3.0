// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `hsl(var(${variableName}))`;
    }
    return `hsl(var(${variableName}) / ${opacityValue})`;
  };
}

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withOpacity("--background"),
        foreground: withOpacity("--foreground"),
        border: withOpacity("--border"),
        input: withOpacity("--input"),
        ring: withOpacity("--ring"),
        destructive: withOpacity("--destructive"),
        "destructive-foreground": withOpacity("--destructive-foreground"),
        muted: withOpacity("--muted"),
        "muted-foreground": withOpacity("--muted-foreground"),
        accent: withOpacity("--accent"),
        "accent-foreground": withOpacity("--accent-foreground"),
        popover: withOpacity("--popover"),
        "popover-foreground": withOpacity("--popover-foreground"),
        card: withOpacity("--card"),
        "card-foreground": withOpacity("--card-foreground"),
      },
    },
  },
  plugins: [],
};
