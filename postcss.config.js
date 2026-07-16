import path from "path";

const __dirname = import.meta.dirname;

export default {
  plugins: {
    tailwindcss: { config: path.join(__dirname, "tailwind.config.js") },
    autoprefixer: {},
  },
}
