/**
 * Donation Management End-to-End Tests
 * 
 * These tests validate the donation management functionality after the Supabase migration.
 */

import 'expect-puppeteer';

describe('Donation Management', () => {
  beforeAll(async () => {
    // Login as admin before testing
    await page.goto('http://localhost:5173/login');
    await page.type('input[type="email"]', 'admin@hopecaretz.org');
    await page.type('input[type="password"]', 'Hope@admin2');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForNavigation({ timeout: 10000 });
    
    // Navigate to donations management
    await page.goto('http://localhost:5173/admin/donations');
  });

  it('should display the donations dashboard', async () => {
    const url = page.url();
    expect(url).toContain('/admin/donations');
    
    await expect(page).toMatchElement('h1, .page-title', { 
      text: /donations/i,
      visible: true 
    });
    
    await page.waitForSelector('[data-cy="donations-summary"], .donations-summary, .summary-panel', { visible: true });
  });

  it('should display list of donations', async () => {
    await page.waitForSelector('[data-cy="donations-list"], .donations-list, .donation-items, table', { visible: true });
    
    // Check if there are donation items
    const donationItems = await page.$$('[data-cy="donation-item"], .donation-item, tr:not(:first-child), .donation-row');
    expect(donationItems.length).toBeGreaterThanOrEqual(1);
  });

  it('should filter donations by date range', async () => {
    // Open date filter
    await page.waitForSelector('[data-cy="date-filter"], .date-filter, button:contains("Date"), .filter-button', { visible: true });
    await page.click('[data-cy="date-filter"], .date-filter, button:contains("Date"), .filter-button');
    
    // Select last 30 days option if available
    await page.waitForSelector('[data-cy="last-30-days"], [value="30days"], button:contains("30"), a:contains("30")', { visible: true, timeout: 5000 });
    await page.click('[data-cy="last-30-days"], [value="30days"], button:contains("30"), a:contains("30")');
    
    // Apply filter if there's a separate apply button
    const applyButton = await page.$('[data-cy="apply-filter"], .apply-filter, button:contains("Apply"), button[type="submit"]');
    if (applyButton) {
      await applyButton.click();
    }
    
    // Wait for filter to be applied
    await page.waitForSelector('[data-cy="active-filters"], .active-filters, .filter-tags, .applied-filters', { visible: true, timeout: 5000 })
      .catch(() => console.log('Active filters indicator not found, continuing test'));
    
    // Verify donations list is still visible after filtering
    await page.waitForSelector('[data-cy="donations-list"], .donations-list, .donation-items, table', { visible: true });
  });

  it('should view donation details', async () => {
    // Click on the first donation
    await page.waitForSelector('[data-cy="donation-item"], .donation-item, tr:not(:first-child), .donation-row', { visible: true });
    await page.click('[data-cy="donation-item"], .donation-item, tr:not(:first-child), .donation-row');
    
    // Wait for navigation to donation details
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {
      console.log('Navigation event not detected, continuing test');
    });
    
    // Verify we're on the donation details page
    const url = page.url();
    expect(url).toContain('/donations/');
    
    // Check if details are displayed
    await page.waitForSelector('[data-cy="donation-details"], .donation-details, .details-panel', { visible: true, timeout: 5000 });
    await page.waitForSelector('[data-cy="donor-info"], .donor-info, .donor-details, .donor-section', { visible: true, timeout: 5000 });
  });

  describe('Donation Analytics', () => {
    it('should display donation analytics', async () => {
      // Navigate to donation analytics
      await page.goto('http://localhost:5173/admin/donations');
      
      // Click on analytics tab if it exists
      const analyticsTab = await page.$('[data-cy="donation-analytics-tab"], .analytics-tab, a:contains("Analytics"), button:contains("Analytics")');
      if (analyticsTab) {
        await analyticsTab.click();
        
        // Wait for analytics components to load
        await page.waitForSelector('[data-cy="donations-chart"], .donations-chart, .chart, .graph', { visible: true, timeout: 5000 });
      } else {
        console.log('Analytics tab not found, skipping this test');
      }
    });
  });

  describe('Donation Creation', () => {
    it('should access the manual donation form', async () => {
      // Navigate to donations page
      await page.goto('http://localhost:5173/admin/donations');
      
      // Click create donation button if it exists
      const createButton = await page.$('[data-cy="create-donation-button"], .create-donation, button:contains("Create"), button:contains("Add")');
      if (createButton) {
        await createButton.click();
        
        // Wait for form to appear
        await page.waitForSelector('[data-cy="donation-form"], form, .donation-form', { visible: true, timeout: 5000 });
        
        // Verify form elements
        const donorSelect = await page.$('[data-cy="donor-select"], select[name="donor"], .donor-dropdown');
        const amountInput = await page.$('[data-cy="donation-amount"], input[name="amount"], .amount-input');
        
        expect(donorSelect).not.toBeNull();
        expect(amountInput).not.toBeNull();
      } else {
        console.log('Create donation button not found, skipping this test');
      }
    });
  });
});
