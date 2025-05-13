#!/usr/bin/env node

// This is a helper script to run Cypress with the correct configuration
// It's needed because the project is configured as an ES module but Cypress needs special handling

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Cypress config file
const configPath = resolve(__dirname, 'cypress.config.cjs');

// Run Cypress with the specified config file
const args = process.argv.slice(2);
const cypressArgs = ['--config-file', configPath, ...args];

console.log(`Running Cypress with config file: ${configPath}`);
console.log(`Cypress arguments: ${cypressArgs.join(' ')}`);

const cypress = spawn('npx', ['cypress', 'open', ...cypressArgs], {
  stdio: 'inherit',
  shell: true
});

cypress.on('close', (code) => {
  process.exit(code);
});
