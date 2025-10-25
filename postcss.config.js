module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      // Force WASM mode to avoid native binding issues on Vercel
      engine: 'wasm',
    },
    autoprefixer: {},
  },
};
