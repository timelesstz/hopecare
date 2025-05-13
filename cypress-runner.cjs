#!/usr/bin/env node

// This is a CommonJS script to run Cypress with the correct configuration
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a temporary Cypress configuration file
const tempConfigPath = path.join(__dirname, 'cypress.temp.config.js');
const configContent = `
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
    ADMIN_EMAIL: 'admin@hopecaretz.org',
    ADMIN_PASSWORD: 'Hope@admin2',
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
});
`;

// Write the temporary configuration file
fs.writeFileSync(tempConfigPath, configContent);

try {
  // Run Cypress with the temporary configuration file
  const command = `npx cypress open --config-file ${tempConfigPath}`;
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running Cypress:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary configuration file
  try {
    fs.unlinkSync(tempConfigPath);
  } catch (error) {
    console.warn('Failed to clean up temporary config file:', error.message);
  }
}
