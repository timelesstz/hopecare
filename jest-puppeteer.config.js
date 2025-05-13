export default {
  launch: {
    headless: false,
    slowMo: 50,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  server: {
    command: 'npm run dev',
    port: 5173,
    launchTimeout: 30000,
    debug: true
  }
};
