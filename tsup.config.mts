import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  splitting: true,
  esbuildOptions(options) {
    options.banner = {
      js: '// @periakteon/dunamisjs - A lightweight, decorator-based routing framework for Express.js',
    };
  },
}); 