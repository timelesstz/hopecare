/**
 * Content Management End-to-End Tests
 * 
 * These tests validate the content management functionality after the Supabase migration.
 * Based on the HopeCare CMS structure with Pages.tsx/Posts.tsx and ContentEditor.tsx
 */

import 'expect-puppeteer';

describe('Content Management System', () => {
  beforeAll(async () => {
    // Login as admin before testing
    await page.goto('http://localhost:5173/login');
    await page.type('input[type="email"]', 'admin@hopecaretz.org');
    await page.type('input[type="password"]', 'Hope@admin2');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForNavigation({ timeout: 10000 });
    
    // Navigate to content management
    await page.goto('http://localhost:5173/admin/content');
  });

  describe('Content Navigation', () => {
    it('should display the main content management view', async () => {
      const url = page.url();
      expect(url).toContain('/admin/content');
      
      await expect(page).toMatchElement('h1, .page-title', { 
        text: /content management/i,
        visible: true 
      });
    });

    it('should navigate to blog posts listing', async () => {
      // Find and click the Blog Posts link/button
      await page.waitForSelector('a[href*="/posts"], button:contains("Blog Posts"), a:contains("Blog Posts")', { visible: true });
      await page.click('a[href*="/posts"], button:contains("Blog Posts"), a:contains("Blog Posts")');
      
      // Wait for navigation
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {
        // Sometimes single-page apps don't trigger navigation events
        console.log('Navigation event not detected, continuing test');
      });
      
      const url = page.url();
      expect(url).toContain('/posts');
      
      await expect(page).toMatchElement('h2, .section-title', { 
        text: /blog posts/i,
        visible: true 
      });
    });

    it('should navigate to pages listing', async () => {
      // Find and click the Pages link/button
      await page.waitForSelector('a[href*="/pages"], button:contains("Pages"), a:contains("Pages")', { visible: true });
      await page.click('a[href*="/pages"], button:contains("Pages"), a:contains("Pages")');
      
      // Wait for navigation
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {
        console.log('Navigation event not detected, continuing test');
      });
      
      const url = page.url();
      expect(url).toContain('/pages');
      
      await expect(page).toMatchElement('h2, .section-title', { 
        text: /pages/i,
        visible: true 
      });
    });
  });

  describe('Blog Post Management', () => {
    beforeEach(async () => {
      // Navigate to blog posts
      await page.goto('http://localhost:5173/admin/content/posts');
    });

    it('should display list of blog posts', async () => {
      await page.waitForSelector('[data-cy="blog-post-list"], .blog-post-list, .posts-list, .content-list', { visible: true });
      
      // Check if there are blog post items
      const postItems = await page.$$('[data-cy="blog-post-item"], .blog-post-item, .post-item, .content-item');
      expect(postItems.length).toBeGreaterThanOrEqual(1);
    });

    it('should create a new blog post', async () => {
      const testTitle = `Test Post ${Date.now()}`;
      
      // Click create new post button
      await page.waitForSelector('[data-cy="create-post-button"], .create-post-button, button:contains("Create"), button:contains("New Post")', { visible: true });
      await page.click('[data-cy="create-post-button"], .create-post-button, button:contains("Create"), button:contains("New Post")');
      
      // Wait for navigation to editor
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {
        console.log('Navigation event not detected, continuing test');
      });
      
      // Verify we're in the editor
      const url = page.url();
      expect(url).toContain('/editor');
      
      // Fill in post details
      await page.waitForSelector('[data-cy="post-title-input"], input[name="title"], .title-input', { visible: true });
      await page.type('[data-cy="post-title-input"], input[name="title"], .title-input', testTitle);
      
      // Type content in editor (could be a rich text editor)
      await page.waitForSelector('[data-cy="post-content-editor"], .content-editor, textarea, [contenteditable]', { visible: true });
      await page.type('[data-cy="post-content-editor"], .content-editor, textarea, [contenteditable]', 'This is a test post content created by Puppeteer.');
      
      // Select status if available
      const statusSelector = await page.$('[data-cy="post-status"], select[name="status"], .status-select');
      if (statusSelector) {
        await page.select('[data-cy="post-status"], select[name="status"], .status-select', 'DRAFT');
      }
      
      // Save the post
      await page.click('[data-cy="save-post-button"], .save-button, button:contains("Save"), button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('[data-cy="success-toast"], .success-message, .toast-success, .alert-success', { visible: true, timeout: 5000 });
    });
  });

  describe('Page Management', () => {
    beforeEach(async () => {
      // Navigate to pages
      await page.goto('http://localhost:5173/admin/content/pages');
    });

    it('should display list of pages', async () => {
      await page.waitForSelector('[data-cy="page-list"], .page-list, .pages-list, .content-list', { visible: true });
      
      // Check if there are page items
      const pageItems = await page.$$('[data-cy="page-item"], .page-item, .content-item');
      expect(pageItems.length).toBeGreaterThanOrEqual(1);
    });
  });
});
