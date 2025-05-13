
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
