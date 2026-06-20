import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'node_modules/**', 'dist/**']
    },
    globals: true,
    deps: {
      inline: ['@angular/common', '@angular/core', '@angular/forms', '@angular/compiler']
    },
    optimizeDeps: {
      include: ['@angular/common', '@angular/core', '@angular/forms', '@angular/compiler']
    }
  }
});
