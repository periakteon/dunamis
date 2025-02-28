import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  esbuildOptions(options) {
    options.banner = {
      js: '// @periakteon/dunamisjs - A lightweight, decorator-based routing framework for Express.js',
    };
  },
}); 