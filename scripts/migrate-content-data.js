/**
 * Content Data Migration Script
 * 
 * This script migrates blog posts and pages from Firebase to Supabase.
 * It handles content transformation, metadata preservation, and ensures data integrity.
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for migration

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// User mapping (Firebase UID to Supabase UUID)
const userMapping = {};

/**
 * Get all users from Supabase to create a mapping
 */
async function loadUserMapping() {
  console.log('Loading user mapping...');
  
  const { data, error } = await supabase.from('users').select('id, firebase_uid');
  
  if (error) {
    console.error('Error loading users:', error);
    return;
  }
  
  // Create mapping from Firebase UID to Supabase UUID
  data.forEach(user => {
    if (user.firebase_uid) {
      userMapping[user.firebase_uid] = user.id;
    }
  });
  
  console.log(`Loaded ${Object.keys(userMapping).length} user mappings`);
}

/**
 * Generate a slug from a title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim();
}

/**
 * Migrate blog posts from Firebase to Supabase
 */
async function migrateBlogPosts() {
  console.log('Migrating blog posts...');
  
  try {
    // Get all blog posts from Firebase
    const blogPostsSnapshot = await getDocs(collection(firestore, 'blogPosts'));
    const totalPosts = blogPostsSnapshot.size;
    
    console.log(`Found ${totalPosts} blog posts to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const doc of blogPostsSnapshot.docs) {
      const postData = doc.data();
      const now = new Date().toISOString();
      
      // Transform Firebase data to Supabase format
      const supabasePost = {
        id: uuidv4(), // Generate new UUID
        title: postData.title || 'Untitled Post',
        slug: postData.slug || generateSlug(postData.title || 'untitled-post'),
        content: postData.content || {},
        excerpt: postData.excerpt || null,
        featured_image: postData.featuredImage || null,
        author_id: postData.authorId ? userMapping[postData.authorId] : null,
        status: postData.status || 'draft',
        categories: postData.categories || [],
        tags: postData.tags || [],
        published_at: postData.publishedAt ? new Date(postData.publishedAt).toISOString() : null,
        created_at: postData.createdAt ? new Date(postData.createdAt).toISOString() : now,
        updated_at: postData.updatedAt ? new Date(postData.updatedAt).toISOString() : now,
        revision_count: 1
      };
      
      // Skip if no title (likely invalid data)
      if (!supabasePost.title) {
        console.warn(`Skipping post with no title: ${doc.id}`);
        continue;
      }
      
      // Insert blog post into Supabase
      const { error } = await supabase.from('blog_posts').insert(supabasePost);
      
      if (error) {
        console.error(`Error migrating blog post ${doc.id}:`, error);
        errorCount++;
      } else {
        // Create initial revision
        const revisionData = {
          content_type: 'blog_post',
          content_id: supabasePost.id,
          content: supabasePost.content,
          revision_number: 1,
          created_by: supabasePost.author_id || Object.values(userMapping)[0], // Use first admin if no author
          created_at: now
        };
        
        const { error: revisionError } = await supabase.from('content_revisions').insert(revisionData);
        
        if (revisionError) {
          console.error(`Error creating revision for blog post ${supabasePost.id}:`, revisionError);
        }
        
        migratedCount++;
        console.log(`Migrated blog post: ${supabasePost.title} (${migratedCount}/${totalPosts})`);
      }
    }
    
    console.log(`Blog post migration complete: ${migratedCount} migrated, ${errorCount} errors`);
    return { migratedCount, errorCount };
  } catch (error) {
    console.error('Error in blog post migration:', error);
    return { migratedCount: 0, errorCount: 1 };
  }
}

/**
 * Migrate pages from Firebase to Supabase
 */
async function migratePages() {
  console.log('Migrating pages...');
  
  try {
    // Get all pages from Firebase
    const pagesSnapshot = await getDocs(collection(firestore, 'pages'));
    const totalPages = pagesSnapshot.size;
    
    console.log(`Found ${totalPages} pages to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create a mapping of Firebase page IDs to their Supabase UUIDs
    const pageIdMapping = {};
    
    // First pass: Create all pages without parent relationships
    for (const doc of pagesSnapshot.docs) {
      const pageData = doc.data();
      const now = new Date().toISOString();
      
      // Transform Firebase data to Supabase format
      const supabasePage = {
        id: uuidv4(), // Generate new UUID
        title: pageData.title || 'Untitled Page',
        slug: pageData.slug || generateSlug(pageData.title || 'untitled-page'),
        content: pageData.content || {},
        meta_description: pageData.metaDescription || null,
        featured_image: pageData.featuredImage || null,
        author_id: pageData.authorId ? userMapping[pageData.authorId] : null,
        status: pageData.status || 'draft',
        template: pageData.template || 'default',
        parent_id: null, // Will be updated in second pass
        sort_order: pageData.sortOrder || 0,
        created_at: pageData.createdAt ? new Date(pageData.createdAt).toISOString() : now,
        updated_at: pageData.updatedAt ? new Date(pageData.updatedAt).toISOString() : now,
        revision_count: 1
      };
      
      // Skip if no title (likely invalid data)
      if (!supabasePage.title) {
        console.warn(`Skipping page with no title: ${doc.id}`);
        continue;
      }
      
      // Insert page into Supabase
      const { error } = await supabase.from('pages').insert(supabasePage);
      
      if (error) {
        console.error(`Error migrating page ${doc.id}:`, error);
        errorCount++;
      } else {
        // Store mapping of Firebase ID to Supabase UUID
        pageIdMapping[doc.id] = supabasePage.id;
        
        // Create initial revision
        const revisionData = {
          content_type: 'page',
          content_id: supabasePage.id,
          content: supabasePage.content,
          revision_number: 1,
          created_by: supabasePage.author_id || Object.values(userMapping)[0], // Use first admin if no author
          created_at: now
        };
        
        const { error: revisionError } = await supabase.from('content_revisions').insert(revisionData);
        
        if (revisionError) {
          console.error(`Error creating revision for page ${supabasePage.id}:`, revisionError);
        }
        
        migratedCount++;
        console.log(`Migrated page: ${supabasePage.title} (${migratedCount}/${totalPages})`);
      }
    }
    
    // Second pass: Update parent relationships
    console.log('Updating page parent relationships...');
    
    for (const doc of pagesSnapshot.docs) {
      const pageData = doc.data();
      
      // Skip if no parent ID or if parent ID is not in our mapping
      if (!pageData.parentId || !pageIdMapping[pageData.parentId] || !pageIdMapping[doc.id]) {
        continue;
      }
      
      // Update parent ID
      const { error } = await supabase
        .from('pages')
        .update({ parent_id: pageIdMapping[pageData.parentId] })
        .eq('id', pageIdMapping[doc.id]);
      
      if (error) {
        console.error(`Error updating parent relationship for page ${doc.id}:`, error);
      } else {
        console.log(`Updated parent relationship for page: ${pageData.title}`);
      }
    }
    
    console.log(`Page migration complete: ${migratedCount} migrated, ${errorCount} errors`);
    return { migratedCount, errorCount };
  } catch (error) {
    console.error('Error in page migration:', error);
    return { migratedCount: 0, errorCount: 1 };
  }
}

/**
 * Main migration function
 */
async function migrateContentData() {
  console.log('Starting content data migration...');
  
  try {
    // Load user mapping
    await loadUserMapping();
    
    // Migrate blog posts
    const blogPostsResult = await migrateBlogPosts();
    
    // Migrate pages
    const pagesResult = await migratePages();
    
    console.log('Content migration summary:');
    console.log(`- Blog posts: ${blogPostsResult.migratedCount} migrated, ${blogPostsResult.errorCount} errors`);
    console.log(`- Pages: ${pagesResult.migratedCount} migrated, ${pagesResult.errorCount} errors`);
    
    console.log('Content data migration complete!');
  } catch (error) {
    console.error('Error in content data migration:', error);
  }
}

// Run migration
migrateContentData().catch(console.error);
