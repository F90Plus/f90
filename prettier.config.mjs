/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind v4 reads its theme from the CSS entrypoint (no tailwind.config.js).
  tailwindStylesheet: './apps/web/src/styles/globals.css',
};

export default config;
