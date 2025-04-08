// @ts-check
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register ts-node hooks
register('ts-node/esm', pathToFileURL('./'));

// Run the migration script
const migrate = spawn('node', [
  '--loader',
  'ts-node/esm',
  '--experimental-specifier-resolution=node',
  './server/migrate.ts'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TS_NODE_PROJECT: './tsconfig.server.json'
  }
});

migrate.on('exit', (code) => {
  process.exit(code || 0);
}); 