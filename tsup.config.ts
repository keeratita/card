import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'vanilla/index': 'src/vanilla/index.ts',
    'react/index': 'src/react/index.ts',
    'angular/index': 'src/angular/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: false,
  minify: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@angular/core',
    '@angular/forms',
    '@angular/compiler',
  ],
});
