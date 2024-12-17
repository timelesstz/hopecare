import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    TEST_USER_EMAIL: 'test@hopecare.org',
    TEST_USER_PASSWORD: 'testpassword123',
    ADMIN_EMAIL: 'admin@hopecare.org',
    ADMIN_PASSWORD: 'adminpassword123',
  },
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
});
