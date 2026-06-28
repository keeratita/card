#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read the root package.json
const rootPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

// Create the dist package.json with correct paths (relative to dist folder)
// Add Angular-specific fields for proper AOT compilation
const distPackageJson = {
  name: rootPackageJson.name,
  version: rootPackageJson.version,
  description: rootPackageJson.description,
  main: './index.js',
  module: './index.mjs',
  types: './index.d.ts',
  sideEffects: [
    '*.css',
    '*.scss',
    './angular/*.js',
    './angular/*.mjs'
  ],
  exports: {
    '.': {
      types: './index.d.ts',
      import: './index.mjs',
      require: './index.js'
    },
    './vanilla': {
      types: './vanilla/index.d.ts',
      import: './vanilla/index.mjs',
      require: './vanilla/index.js'
    },
    './react': {
      types: './react/index.d.ts',
      import: './react/index.mjs',
      require: './react/index.js'
    },
    './angular': {
      types: './angular/index.d.ts',
      import: './angular/index.mjs',
      require: './angular/index.js'
    }
  },
  files: ['.'],
  keywords: rootPackageJson.keywords,
  author: rootPackageJson.author,
  repository: rootPackageJson.repository,
  bugs: rootPackageJson.bugs,
  homepage: rootPackageJson.homepage,
  license: rootPackageJson.license,
  peerDependencies: rootPackageJson.peerDependencies,
  peerDependenciesMeta: rootPackageJson.peerDependenciesMeta,
  // Angular-specific fields for proper AOT compilation with Ivy
  'ngPackage': {
    'lib': {
      'entryFile': './angular/index.ts'
    }
  },
  // Mark as fully compiled for Angular
  'es2020': './index.mjs',
  'es2022': './index.mjs'
};

// Write to dist folder
const distPath = path.join(__dirname, '..', 'dist', 'package.json');
fs.writeFileSync(distPath, JSON.stringify(distPackageJson, null, 2));
console.log('Generated dist/package.json with correct paths');
