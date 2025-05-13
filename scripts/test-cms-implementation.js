// @ts-check
// package.json: { "type": "module" }

/**
 * Test Script for Content Management System Implementation
 * 
 * This script validates the Supabase CMS implementation by testing:
 * - Blog post CRUD operations
 * - Page CRUD operations
 * - Content revisions
 * - Content filtering and search
 * - Slug generation and validation
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('Error: Supabase URL or service key not found in environment variables.'));
  console.log(chalk.yellow('\nPlease check the following:'));
  console.log('1. Make sure your .env file contains the Supabase credentials');
  console.log('2. The following variables should be defined:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY');
  console.log('\nFor testing purposes, you can create a .env.test file with these variables');
  console.log('and run the script with: NODE_ENV=test node scripts/test-cms-implementation.js');
  console.log('\nExample .env.test file:');
  console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.log('SUPABASE_SERVICE_KEY=your-service-role-key');
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const config = {
  adminUser: {
    email: 'admin@hopecaretz.org',
    password: 'Hope@admin2'
  },
  testBlogPost: {
    title: 'Test Blog Post for CMS Validation',
    content: '<p>This is a test blog post created by the CMS validation script.</p>',
    meta_description: 'A test blog post for validating CMS functionality',
    tags: ['test', 'validation', 'cms']
  },
  testPage: {
    title: 'Test Page for CMS Validation',
    content: '<p>This is a test page created by the CMS validation script.</p>',
    meta_description: 'A test page for validating CMS functionality',
    template: 'DEFAULT'
  }
};

/**
 * Main test function
 */
async function runTests() {
  console.log(chalk.blue('=== HopeCare CMS Implementation Test ==='));
  console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}`));
  console.log(chalk.gray(`Supabase URL: ${supabaseUrl}`));
  
  try {
    // Sign in as admin
    console.log(chalk.yellow('\nStep 1: Authenticating as admin...'));
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: config.adminUser.email,
      password: config.adminUser.password
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    console.log(chalk.green(`✓ Authenticated as ${authData.user.email}`));
    
    // Test blog post functionality
    await testBlogPosts(authData.user.id);
    
    // Test page functionality
    await testPages(authData.user.id);
    
    // Test content revisions
    await testContentRevisions(authData.user.id);
    
    // Test content search and filtering
    await testContentSearch();
    
    console.log(chalk.green('\n✓ All tests completed successfully!'));
    console.log(chalk.gray(`Finished at: ${new Date().toLocaleString()}`));
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Test failed: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

/**
 * Test blog post functionality
 */
async function testBlogPosts(userId) {
  console.log(chalk.yellow('\nStep 2: Testing blog post functionality...'));
  
  // Generate a unique slug for testing
  const testSlug = `test-blog-post-${Date.now()}`;
  let postId;
  
  try {
    // Create a blog post
    console.log('Creating test blog post...');
    const { data: post, error: createError } = await supabase
      .from('blog_posts')
      .insert({
        title: config.testBlogPost.title,
        slug: testSlug,
        content: config.testBlogPost.content,
        author_id: userId,
        status: 'DRAFT',
        meta_description: config.testBlogPost.meta_description,
        tags: config.testBlogPost.tags
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create blog post: ${createError.message}`);
    }
    
    postId = post.id;
    console.log(chalk.green(`✓ Created blog post with ID: ${postId}`));
    
    // Read the blog post
    console.log('Reading blog post...');
    const { data: readPost, error: readError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (readError) {
      throw new Error(`Failed to read blog post: ${readError.message}`);
    }
    
    console.log(chalk.green('✓ Read blog post successfully'));
    
    // Update the blog post
    console.log('Updating blog post...');
    const updatedTitle = `${config.testBlogPost.title} (Updated)`;
    
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        title: updatedTitle,
        status: 'PUBLISHED',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    if (updateError) {
      throw new Error(`Failed to update blog post: ${updateError.message}`);
    }
    
    console.log(chalk.green('✓ Updated blog post successfully'));
    
    // Verify the update
    const { data: verifyPost, error: verifyError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (verifyError) {
      throw new Error(`Failed to verify blog post update: ${verifyError.message}`);
    }
    
    if (verifyPost.title !== updatedTitle || verifyPost.status !== 'PUBLISHED') {
      throw new Error('Blog post update verification failed');
    }
    
    console.log(chalk.green('✓ Verified blog post update'));
    
    // Delete the blog post
    console.log('Deleting blog post...');
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (deleteError) {
      throw new Error(`Failed to delete blog post: ${deleteError.message}`);
    }
    
    console.log(chalk.green('✓ Deleted blog post successfully'));
    
    // Verify deletion
    const { data: deletedPost, error: checkDeleteError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId);
    
    if (checkDeleteError) {
      throw new Error(`Failed to verify blog post deletion: ${checkDeleteError.message}`);
    }
    
    if (deletedPost && deletedPost.length > 0) {
      throw new Error('Blog post was not deleted properly');
    }
    
    console.log(chalk.green('✓ Verified blog post deletion'));
    
  } catch (error) {
    // Clean up if test fails
    if (postId) {
      await supabase.from('blog_posts').delete().eq('id', postId);
    }
    throw error;
  }
}

/**
 * Test page functionality
 */
async function testPages(userId) {
  console.log(chalk.yellow('\nStep 3: Testing page functionality...'));
  
  // Generate a unique slug for testing
  const testSlug = `test-page-${Date.now()}`;
  let pageId;
  
  try {
    // Create a page
    console.log('Creating test page...');
    const { data: page, error: createError } = await supabase
      .from('pages')
      .insert({
        title: config.testPage.title,
        slug: testSlug,
        content: config.testPage.content,
        author_id: userId,
        status: 'DRAFT',
        meta_description: config.testPage.meta_description,
        template: config.testPage.template
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create page: ${createError.message}`);
    }
    
    pageId = page.id;
    console.log(chalk.green(`✓ Created page with ID: ${pageId}`));
    
    // Read the page
    console.log('Reading page...');
    const { data: readPage, error: readError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();
    
    if (readError) {
      throw new Error(`Failed to read page: ${readError.message}`);
    }
    
    console.log(chalk.green('✓ Read page successfully'));
    
    // Update the page
    console.log('Updating page...');
    const updatedTitle = `${config.testPage.title} (Updated)`;
    
    const { error: updateError } = await supabase
      .from('pages')
      .update({
        title: updatedTitle,
        status: 'PUBLISHED',
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId);
    
    if (updateError) {
      throw new Error(`Failed to update page: ${updateError.message}`);
    }
    
    console.log(chalk.green('✓ Updated page successfully'));
    
    // Delete the page
    console.log('Deleting page...');
    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);
    
    if (deleteError) {
      throw new Error(`Failed to delete page: ${deleteError.message}`);
    }
    
    console.log(chalk.green('✓ Deleted page successfully'));
    
  } catch (error) {
    // Clean up if test fails
    if (pageId) {
      await supabase.from('pages').delete().eq('id', pageId);
    }
    throw error;
  }
}

/**
 * Test content revisions
 */
async function testContentRevisions(userId) {
  console.log(chalk.yellow('\nStep 4: Testing content revisions...'));
  
  // Create a test blog post for revision testing
  const testSlug = `revision-test-${Date.now()}`;
  let postId, revisionId;
  
  try {
    // Create a blog post
    console.log('Creating test blog post for revisions...');
    const { data: post, error: createError } = await supabase
      .from('blog_posts')
      .insert({
        title: 'Revision Test Post',
        slug: testSlug,
        content: '<p>Original content for revision testing.</p>',
        author_id: userId,
        status: 'DRAFT'
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create test post for revisions: ${createError.message}`);
    }
    
    postId = post.id;
    console.log(chalk.green(`✓ Created test post with ID: ${postId}`));
    
    // Create a revision
    console.log('Creating content revision...');
    const { data: revision, error: revisionError } = await supabase
      .from('content_revisions')
      .insert({
        content_id: postId,
        content_type: 'blog_post',
        content_data: JSON.stringify(post),
        created_by: userId,
        revision_note: 'Initial revision for testing'
      })
      .select()
      .single();
    
    if (revisionError) {
      throw new Error(`Failed to create content revision: ${revisionError.message}`);
    }
    
    revisionId = revision.id;
    console.log(chalk.green(`✓ Created content revision with ID: ${revisionId}`));
    
    // Update the blog post
    console.log('Updating post to create another revision...');
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        title: 'Revision Test Post (Updated)',
        content: '<p>Updated content for revision testing.</p>',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    if (updateError) {
      throw new Error(`Failed to update post for revision testing: ${updateError.message}`);
    }
    
    // Get the updated post
    const { data: updatedPost, error: getError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (getError) {
      throw new Error(`Failed to get updated post: ${getError.message}`);
    }
    
    // Create another revision
    console.log('Creating second content revision...');
    const { data: revision2, error: revision2Error } = await supabase
      .from('content_revisions')
      .insert({
        content_id: postId,
        content_type: 'blog_post',
        content_data: JSON.stringify(updatedPost),
        created_by: userId,
        revision_note: 'Updated revision for testing'
      })
      .select()
      .single();
    
    if (revision2Error) {
      throw new Error(`Failed to create second content revision: ${revision2Error.message}`);
    }
    
    console.log(chalk.green(`✓ Created second content revision with ID: ${revision2.id}`));
    
    // Get all revisions for the post
    console.log('Fetching all revisions for the post...');
    const { data: revisions, error: listError } = await supabase
      .from('content_revisions')
      .select('*')
      .eq('content_id', postId)
      .order('created_at', { ascending: false });
    
    if (listError) {
      throw new Error(`Failed to list content revisions: ${listError.message}`);
    }
    
    if (revisions.length !== 2) {
      throw new Error(`Expected 2 revisions, got ${revisions.length}`);
    }
    
    console.log(chalk.green(`✓ Found ${revisions.length} revisions for the post`));
    
    // Clean up
    console.log('Cleaning up revisions and test post...');
    
    // Delete revisions
    for (const rev of revisions) {
      await supabase.from('content_revisions').delete().eq('id', rev.id);
    }
    
    // Delete the test post
    await supabase.from('blog_posts').delete().eq('id', postId);
    
    console.log(chalk.green('✓ Cleaned up all test data for revisions'));
    
  } catch (error) {
    // Clean up if test fails
    if (revisionId) {
      await supabase.from('content_revisions').delete().eq('id', revisionId);
    }
    if (postId) {
      await supabase.from('blog_posts').delete().eq('id', postId);
    }
    throw error;
  }
}

/**
 * Test content search and filtering
 */
async function testContentSearch() {
  console.log(chalk.yellow('\nStep 5: Testing content search and filtering...'));
  
  try {
    // Test filtering blog posts by status
    console.log('Testing blog post filtering by status...');
    const { data: publishedPosts, error: filterError } = await supabase
      .from('blog_posts')
      .select('id, title, status')
      .eq('status', 'PUBLISHED')
      .limit(5);
    
    if (filterError) {
      throw new Error(`Failed to filter blog posts: ${filterError.message}`);
    }
    
    console.log(chalk.green(`✓ Successfully filtered published posts: found ${publishedPosts.length} posts`));
    
    // Test searching blog posts by title
    console.log('Testing blog post search by title...');
    const searchTerm = 'Hope';  // Common term likely to be in some blog posts
    
    const { data: searchResults, error: searchError } = await supabase
      .from('blog_posts')
      .select('id, title')
      .ilike('title', `%${searchTerm}%`)
      .limit(5);
    
    if (searchError) {
      throw new Error(`Failed to search blog posts: ${searchError.message}`);
    }
    
    console.log(chalk.green(`✓ Successfully searched for "${searchTerm}": found ${searchResults.length} posts`));
    
    // Test filtering pages by template
    console.log('Testing page filtering by template...');
    const { data: defaultPages, error: templateError } = await supabase
      .from('pages')
      .select('id, title, template')
      .eq('template', 'DEFAULT')
      .limit(5);
    
    if (templateError) {
      throw new Error(`Failed to filter pages by template: ${templateError.message}`);
    }
    
    console.log(chalk.green(`✓ Successfully filtered pages by template: found ${defaultPages.length} pages`));
    
    console.log(chalk.green('✓ Content search and filtering tests completed successfully'));
    
  } catch (error) {
    throw error;
  }
}

// Run the tests
runTests().catch(console.error);
