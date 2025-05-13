/**
 * Authentication End-to-End Tests
 * 
 * These tests validate the authentication functionality after the Supabase migration.
 */

import 'expect-puppeteer';

describe('Authentication', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:5173/login');
  });

  it('should display the login form', async () => {
    await expect(page).toMatchElement('form', { visible: true });
    await expect(page).toMatchElement('input[type="email"]', { visible: true });
    await expect(page).toMatchElement('input[type="password"]', { visible: true });
    await expect(page).toMatchElement('button[type="submit"]', { visible: true });
  });

  it('should show error with invalid credentials', async () => {
    await page.type('input[type="email"]', 'wrong@example.com');
    await page.type('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message to appear
    await page.waitForSelector('[data-cy="auth-error"], .auth-error, .error-message', { visible: true, timeout: 5000 });
  });

  it('should login successfully with valid credentials', async () => {
    // Clear previous input
    await page.evaluate(() => {
      document.querySelector('input[type="email"]').value = '';
      document.querySelector('input[type="password"]').value = '';
    });
    
    // Enter admin credentials
    await page.type('input[type="email"]', 'admin@hopecaretz.org');
    await page.type('input[type="password"]', 'Hope@admin2');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForNavigation({ timeout: 10000 });
    
    // Verify we're on the admin page
    const url = page.url();
    expect(url).toContain('/admin');
  });

  it('should logout successfully', async () => {
    // Find and click the user menu
    await page.waitForSelector('[data-cy="user-menu"], .user-menu, .avatar, .profile-icon', { visible: true, timeout: 5000 });
    await page.click('[data-cy="user-menu"], .user-menu, .avatar, .profile-icon');
    
    // Find and click the logout button
    await page.waitForSelector('[data-cy="logout-button"], .logout-button, button:contains("Logout"), a:contains("Logout")', { visible: true, timeout: 5000 });
    await page.click('[data-cy="logout-button"], .logout-button, button:contains("Logout"), a:contains("Logout")');
    
    // Wait for redirect to login page
    await page.waitForNavigation({ timeout: 10000 });
    
    // Verify we're back on the login page
    const url = page.url();
    expect(url).toContain('/login');
  });
});
