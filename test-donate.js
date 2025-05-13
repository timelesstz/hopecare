// Simple script to test if the Donate page loads correctly
const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting test for Donate page...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);
    
    // Find and click the Donate link
    console.log('Clicking on Donate link...');
    const donateLink = await page.$('a[href="/donate"]');
    if (donateLink) {
      await donateLink.click();
      await page.waitForTimeout(3000);
      
      // Check if we're on the donate page
      const url = page.url();
      if (url.includes('/donate')) {
        console.log('✅ Successfully navigated to Donate page!');
      } else {
        console.error('❌ Failed to navigate to Donate page');
      }
      
      // Check for error messages on the page
      const errorText = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('*:contains("Error:")');
        return errorElements.length > 0 ? errorElements[0].textContent : null;
      });
      
      if (errorText) {
        console.error('❌ Error found on page:', errorText);
      } else {
        console.log('✅ No errors found on the Donate page');
      }
    } else {
      console.error('❌ Could not find Donate link');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
  }
})();
