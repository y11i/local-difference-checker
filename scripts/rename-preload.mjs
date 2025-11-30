import { renameSync, existsSync } from 'node:fs';

const preloadJs = 'dist/main/preload.js';
const preloadCjs = 'dist/main/preload.cjs';
const mapJs = 'dist/main/preload.js.map';
const mapCjs = 'dist/main/preload.cjs.map';

if (existsSync(preloadJs)) {
  renameSync(preloadJs, preloadCjs);
  console.log('✓ Renamed preload.js to preload.cjs');
}

if (existsSync(mapJs)) {
  renameSync(mapJs, mapCjs);
  console.log('✓ Renamed preload.js.map to preload.cjs.map');
}

