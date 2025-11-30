import { watch } from 'node:fs';
import { renameSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const preloadJs = 'dist/main/preload.js';
const preloadCjs = 'dist/main/preload.cjs';
const mapJs = 'dist/main/preload.js.map';
const mapCjs = 'dist/main/preload.cjs.map';

function renamePreload() {
  if (existsSync(preloadJs)) {
    try {
      renameSync(preloadJs, preloadCjs);
      console.log('✓ Renamed preload.js to preload.cjs');
    } catch (err) {
      // File might be locked, ignore
    }
  }
  if (existsSync(mapJs)) {
    try {
      renameSync(mapJs, mapCjs);
    } catch (err) {
      // File might be locked, ignore
    }
  }
}

// Start TypeScript compiler in watch mode
const tsc = spawn('tsc', ['-p', 'tsconfig.preload.json', '--watch', '--preserveWatchOutput'], {
  stdio: 'inherit',
  shell: true
});

// Watch for file changes and rename
if (existsSync('dist/main')) {
  watch('dist/main', { recursive: false }, (eventType, filename) => {
    if (filename === 'preload.js' || filename === 'preload.js.map') {
      setTimeout(renamePreload, 100); // Small delay to ensure file is written
    }
  });
}

// Initial rename
setTimeout(renamePreload, 500);

// Cleanup on exit
process.on('SIGINT', () => {
  tsc.kill();
  process.exit(0);
});

tsc.on('exit', (code) => {
  process.exit(code || 0);
});

