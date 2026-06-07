/** @type {import("prettier").Config} */
module.exports = {
  plugins: ['prettier-plugin-css-order', 'prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  tailwindAttributes: ['className'],
  tailwindFunctions: ['clsx', 'cn'],
  tailwindStylesheet: './packages/config-tailwind/index.css',
}
