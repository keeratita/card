#!/usr/bin/env node
/**
 * Bundles the Angular entry's partially-compiled output (from `ngc -p
 * tsconfig.ngc.partial.json` into .ngcompile/) over the tsup output in
 * dist/angular/.
 *
 * Why: tsup/esbuild emits runtime decorators, which Angular AOT consumers
 * cannot resolve as standalone components/directives (NG2012). The Angular
 * compiler's partial-compilation output (ɵɵngDeclare*) is the contract modern
 * AOT builds (Angular CLI, ng-packagr-style libs) rely on.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const compileDir = path.join(root, '.ngcompile');
const bundleDir = path.join(root, '.ngbundle');

if (!fs.existsSync(path.join(compileDir, 'angular', 'index.js'))) {
  throw new Error(
    'Partial-compiled Angular entry not found. Run `npx ngc -p tsconfig.ngc.partial.json` first.',
  );
}

// Bundle the partially-compiled entry (ESM + CJS + dts), externalizing Angular
execSync(
  'npx tsup .ngcompile/angular/index.js --format cjs,esm --dts ' +
    '--external @angular/core,@angular/forms --out-dir .ngbundle ' +
    '--clean',
  { cwd: root, stdio: 'inherit' },
);

// Overwrite dist/angular/* with the partial-compiled artifacts (the tsup
// src-based build already produced the other entries and the CJS/ESM shape).
const distAngular = path.join(root, 'dist', 'angular');
fs.mkdirSync(distAngular, { recursive: true });
const copies = [
  ['index.mjs', 'index.mjs'],
  ['index.js', 'index.js'],
  ['index.d.mts', 'index.d.ts'],
];
for (const [from, to] of copies) {
  const src = path.join(bundleDir, from);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing bundled artifact: ${from}`);
  }
  fs.copyFileSync(src, path.join(distAngular, to));
}
// Remove the tsup-emitted ESM dts from the source build — the partially
// compiled index.d.ts (copied above) is the authoritative Angular contract.
for (const stale of ['index.d.mts', 'index.d.cts']) {
  fs.rmSync(path.join(distAngular, stale), { force: true });
}
console.log('Shipped partially-compiled Angular entry to dist/angular/');
