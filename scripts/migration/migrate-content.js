// Script to migrate content (blog posts, pages, etc.) from Firebase to Supabase
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: new URL('../../../.env', import.meta.url).pathname });

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://tkxppievtqiipcsdqbpf.supabase.co`;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Service key available:', !!supabaseServiceKey);

// Initialize Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Firebase Admin SDK (if not already initialized)
try {
  admin.app();
} catch (error) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
      databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  } catch (initError) {
    console.error('Error initializing Firebase Admin SDK:', initError.message);
    console.log('Checking for service-account.json file...');
    
    // Try to load from service-account.json if environment variable is not available
    try {
      const serviceAccountPath = path.join(__dirname, '../../../service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        console.log('Firebase Admin SDK initialized from service-account.json');
      } else {
        console.error('service-account.json file not found');
        process.exit(1);
      }
    } catch (fileError) {
      console.error('Error loading service-account.json:', fileError.message);
      process.exit(1);
    }
  }
}

// Function to migrate blog posts
async function migrateBlogPosts() {
  try {
    console.log('Migrating blog posts...');
    
    // Create blog_posts table in Supabase if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_blog_posts_table_if_not_exists');
    
    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating blog_posts table:', tableError.message);
      // Continue anyway, as the table might already exist
    }
    
    // Get all blog posts from Firebase
    const blogPostsSnapshot = await admin.firestore().collection('blog_posts').get();
    const blogPosts = blogPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${blogPosts.length} blog posts in Firebase`);
    
    // Track migration statistics
    let successCount = 0;
    let failureCount = 0;
    
    // Migrate each blog post
    for (const post of blogPosts) {
      try {
        console.log(`Migrating blog post: ${post.title || post.id}`);
        
        // Check if post already exists in Supabase
        const { data: existingPost, error: checkError } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('firebase_id', post.id)
          .maybeSingle();
          
        if (checkError && !checkError.message.includes('does not exist')) {
          console.error(`Error checking for existing blog post ${post.id}:`, checkError.message);
        }
        
        if (existingPost) {
          console.log(`Blog post ${post.id} already exists in Supabase, updating...`);
          
          // Update existing post
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({
              title: post.title || '',
              content: post.content || '',
              summary: post.summary || '',
              author_id: post.author_id || null,
              author_name: post.author_name || '',
              published: post.published || false,
              featured: post.featured || false,
              image_url: post.image_url || null,
              tags: post.tags || [],
              updated_at: new Date().toISOString()
            })
            .eq('firebase_id', post.id);
            
          if (updateError) {
            console.error(`Error updating blog post ${post.id}:`, updateError.message);
            failureCount++;
          } else {
            console.log(`Blog post ${post.id} updated successfully`);
            successCount++;
          }
        } else {
          // Create new post in Supabase
          const { error: insertError } = await supabase
            .from('blog_posts')
            .insert({
              firebase_id: post.id,
              title: post.title || '',
              content: post.content || '',
              summary: post.summary || '',
              author_id: post.author_id || null,
              author_name: post.author_name || '',
              published: post.published || false,
              featured: post.featured || false,
              image_url: post.image_url || null,
              tags: post.tags || [],
              created_at: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
              updated_at: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error creating blog post ${post.id}:`, insertError.message);
            failureCount++;
          } else {
            console.log(`Blog post ${post.id} created successfully`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error migrating blog post ${post.id}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\nBlog posts migration completed:');
    console.log(`- Total posts: ${blogPosts.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${failureCount}`);
    
    return { total: blogPosts.length, success: successCount, failure: failureCount };
  } catch (error) {
    console.error('Error during blog posts migration:', error.message);
    return { total: 0, success: 0, failure: 0 };
  }
}

// Function to migrate pages
async function migratePages() {
  try {
    console.log('\nMigrating pages...');
    
    // Create pages table in Supabase if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_pages_table_if_not_exists');
    
    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating pages table:', tableError.message);
      // Continue anyway, as the table might already exist
    }
    
    // Get all pages from Firebase
    const pagesSnapshot = await admin.firestore().collection('pages').get();
    const pages = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${pages.length} pages in Firebase`);
    
    // Track migration statistics
    let successCount = 0;
    let failureCount = 0;
    
    // Migrate each page
    for (const page of pages) {
      try {
        console.log(`Migrating page: ${page.title || page.id}`);
        
        // Check if page already exists in Supabase
        const { data: existingPage, error: checkError } = await supabase
          .from('pages')
          .select('id')
          .eq('firebase_id', page.id)
          .maybeSingle();
          
        if (checkError && !checkError.message.includes('does not exist')) {
          console.error(`Error checking for existing page ${page.id}:`, checkError.message);
        }
        
        if (existingPage) {
          console.log(`Page ${page.id} already exists in Supabase, updating...`);
          
          // Update existing page
          const { error: updateError } = await supabase
            .from('pages')
            .update({
              title: page.title || '',
              content: page.content || '',
              slug: page.slug || page.id,
              meta_description: page.meta_description || '',
              published: page.published || false,
              author_id: page.author_id || null,
              author_name: page.author_name || '',
              updated_at: new Date().toISOString()
            })
            .eq('firebase_id', page.id);
            
          if (updateError) {
            console.error(`Error updating page ${page.id}:`, updateError.message);
            failureCount++;
          } else {
            console.log(`Page ${page.id} updated successfully`);
            successCount++;
          }
        } else {
          // Create new page in Supabase
          const { error: insertError } = await supabase
            .from('pages')
            .insert({
              firebase_id: page.id,
              title: page.title || '',
              content: page.content || '',
              slug: page.slug || page.id,
              meta_description: page.meta_description || '',
              published: page.published || false,
              author_id: page.author_id || null,
              author_name: page.author_name || '',
              created_at: page.created_at ? new Date(page.created_at).toISOString() : new Date().toISOString(),
              updated_at: page.updated_at ? new Date(page.updated_at).toISOString() : new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error creating page ${page.id}:`, insertError.message);
            failureCount++;
          } else {
            console.log(`Page ${page.id} created successfully`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error migrating page ${page.id}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\nPages migration completed:');
    console.log(`- Total pages: ${pages.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${failureCount}`);
    
    return { total: pages.length, success: successCount, failure: failureCount };
  } catch (error) {
    console.error('Error during pages migration:', error.message);
    return { total: 0, success: 0, failure: 0 };
  }
}

// Function to migrate donations
async function migrateDonations() {
  try {
    console.log('\nMigrating donations...');
    
    // Create donations table in Supabase if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_donations_table_if_not_exists');
    
    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating donations table:', tableError.message);
      // Continue anyway, as the table might already exist
    }
    
    // Get all donations from Firebase
    const donationsSnapshot = await admin.firestore().collection('donations').get();
    const donations = donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${donations.length} donations in Firebase`);
    
    // Track migration statistics
    let successCount = 0;
    let failureCount = 0;
    
    // Migrate each donation
    for (const donation of donations) {
      try {
        console.log(`Migrating donation: ${donation.id}`);
        
        // Check if donation already exists in Supabase
        const { data: existingDonation, error: checkError } = await supabase
          .from('donations')
          .select('id')
          .eq('firebase_id', donation.id)
          .maybeSingle();
          
        if (checkError && !checkError.message.includes('does not exist')) {
          console.error(`Error checking for existing donation ${donation.id}:`, checkError.message);
        }
        
        if (existingDonation) {
          console.log(`Donation ${donation.id} already exists in Supabase, skipping...`);
          successCount++;
        } else {
          // Create new donation in Supabase
          const { error: insertError } = await supabase
            .from('donations')
            .insert({
              firebase_id: donation.id,
              donor_id: donation.donor_id || null,
              donor_name: donation.donor_name || 'Anonymous',
              donor_email: donation.donor_email || null,
              amount: donation.amount || 0,
              currency: donation.currency || 'USD',
              status: donation.status || 'completed',
              payment_method: donation.payment_method || 'card',
              transaction_id: donation.transaction_id || null,
              campaign: donation.campaign || null,
              is_anonymous: donation.is_anonymous || false,
              message: donation.message || null,
              created_at: donation.created_at ? new Date(donation.created_at).toISOString() : new Date().toISOString(),
              updated_at: donation.updated_at ? new Date(donation.updated_at).toISOString() : new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error creating donation ${donation.id}:`, insertError.message);
            failureCount++;
          } else {
            console.log(`Donation ${donation.id} created successfully`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error migrating donation ${donation.id}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\nDonations migration completed:');
    console.log(`- Total donations: ${donations.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${failureCount}`);
    
    return { total: donations.length, success: successCount, failure: failureCount };
  } catch (error) {
    console.error('Error during donations migration:', error.message);
    return { total: 0, success: 0, failure: 0 };
  }
}

// Function to migrate volunteer opportunities
async function migrateOpportunities() {
  try {
    console.log('\nMigrating volunteer opportunities...');
    
    // Get all opportunities from Firebase
    const opportunitiesSnapshot = await admin.firestore().collection('opportunities').get();
    const opportunities = opportunitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${opportunities.length} volunteer opportunities in Firebase`);
    
    // Track migration statistics
    let successCount = 0;
    let failureCount = 0;
    
    // Migrate each opportunity
    for (const opportunity of opportunities) {
      try {
        console.log(`Migrating opportunity: ${opportunity.title || opportunity.id}`);
        
        // Check if opportunity already exists in Supabase
        const { data: existingOpportunity, error: checkError } = await supabase
          .from('opportunities')
          .select('id')
          .eq('firebase_id', opportunity.id)
          .maybeSingle();
          
        if (checkError && !checkError.message.includes('does not exist')) {
          console.error(`Error checking for existing opportunity ${opportunity.id}:`, checkError.message);
        }
        
        if (existingOpportunity) {
          console.log(`Opportunity ${opportunity.id} already exists in Supabase, updating...`);
          
          // Update existing opportunity
          const { error: updateError } = await supabase
            .from('opportunities')
            .update({
              title: opportunity.title || '',
              description: opportunity.description || '',
              location: opportunity.location || '',
              start_date: opportunity.start_date ? new Date(opportunity.start_date).toISOString() : null,
              end_date: opportunity.end_date ? new Date(opportunity.end_date).toISOString() : null,
              skills_required: opportunity.skills_required || [],
              status: opportunity.status || 'active',
              coordinator_id: opportunity.coordinator_id || null,
              coordinator_name: opportunity.coordinator_name || '',
              image: opportunity.image || null,
              max_volunteers: opportunity.max_volunteers || null,
              current_volunteers: opportunity.current_volunteers || 0,
              applicants: opportunity.applicants || [],
              updated_at: new Date().toISOString()
            })
            .eq('firebase_id', opportunity.id);
            
          if (updateError) {
            console.error(`Error updating opportunity ${opportunity.id}:`, updateError.message);
            failureCount++;
          } else {
            console.log(`Opportunity ${opportunity.id} updated successfully`);
            successCount++;
          }
        } else {
          // Create new opportunity in Supabase
          const { error: insertError } = await supabase
            .from('opportunities')
            .insert({
              firebase_id: opportunity.id,
              title: opportunity.title || '',
              description: opportunity.description || '',
              location: opportunity.location || '',
              start_date: opportunity.start_date ? new Date(opportunity.start_date).toISOString() : null,
              end_date: opportunity.end_date ? new Date(opportunity.end_date).toISOString() : null,
              skills_required: opportunity.skills_required || [],
              status: opportunity.status || 'active',
              coordinator_id: opportunity.coordinator_id || null,
              coordinator_name: opportunity.coordinator_name || '',
              image: opportunity.image || null,
              max_volunteers: opportunity.max_volunteers || null,
              current_volunteers: opportunity.current_volunteers || 0,
              applicants: opportunity.applicants || [],
              created_at: opportunity.created_at ? new Date(opportunity.created_at).toISOString() : new Date().toISOString(),
              updated_at: opportunity.updated_at ? new Date(opportunity.updated_at).toISOString() : new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error creating opportunity ${opportunity.id}:`, insertError.message);
            failureCount++;
          } else {
            console.log(`Opportunity ${opportunity.id} created successfully`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error migrating opportunity ${opportunity.id}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\nVolunteer opportunities migration completed:');
    console.log(`- Total opportunities: ${opportunities.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${failureCount}`);
    
    return { total: opportunities.length, success: successCount, failure: failureCount };
  } catch (error) {
    console.error('Error during volunteer opportunities migration:', error.message);
    return { total: 0, success: 0, failure: 0 };
  }
}

// Main migration function
async function migrateContent() {
  try {
    console.log('Starting content migration from Firebase to Supabase...');
    
    // Create stored procedures for table creation if they don't exist
    await createStoredProcedures();
    
    // Migrate different content types
    const blogPostsStats = await migrateBlogPosts();
    const pagesStats = await migratePages();
    const donationsStats = await migrateDonations();
    const opportunitiesStats = await migrateOpportunities();
    
    // Print overall summary
    console.log('\n========== MIGRATION SUMMARY ==========');
    console.log('Blog Posts:');
    console.log(`- Total: ${blogPostsStats.total}`);
    console.log(`- Success: ${blogPostsStats.success}`);
    console.log(`- Failed: ${blogPostsStats.failure}`);
    
    console.log('\nPages:');
    console.log(`- Total: ${pagesStats.total}`);
    console.log(`- Success: ${pagesStats.success}`);
    console.log(`- Failed: ${pagesStats.failure}`);
    
    console.log('\nDonations:');
    console.log(`- Total: ${donationsStats.total}`);
    console.log(`- Success: ${donationsStats.success}`);
    console.log(`- Failed: ${donationsStats.failure}`);
    
    console.log('\nVolunteer Opportunities:');
    console.log(`- Total: ${opportunitiesStats.total}`);
    console.log(`- Success: ${opportunitiesStats.success}`);
    console.log(`- Failed: ${opportunitiesStats.failure}`);
    
    const totalItems = blogPostsStats.total + pagesStats.total + donationsStats.total + opportunitiesStats.total;
    const totalSuccess = blogPostsStats.success + pagesStats.success + donationsStats.success + opportunitiesStats.success;
    const totalFailure = blogPostsStats.failure + pagesStats.failure + donationsStats.failure + opportunitiesStats.failure;
    
    console.log('\nOverall:');
    console.log(`- Total items: ${totalItems}`);
    console.log(`- Successfully migrated: ${totalSuccess} (${Math.round(totalSuccess / totalItems * 100)}%)`);
    console.log(`- Failed to migrate: ${totalFailure} (${Math.round(totalFailure / totalItems * 100)}%)`);
    console.log('=======================================');
    
  } catch (error) {
    console.error('Error during content migration:', error.message);
    process.exit(1);
  }
}

// Create stored procedures for table creation
async function createStoredProcedures() {
  try {
    // Create stored procedure for blog_posts table
    const { error: blogPostsError } = await supabase.rpc('create_function_create_blog_posts_table', {
      function_body: `
        BEGIN
          CREATE TABLE IF NOT EXISTS public.blog_posts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            firebase_id TEXT UNIQUE,
            title TEXT NOT NULL,
            content TEXT,
            summary TEXT,
            author_id UUID REFERENCES auth.users(id),
            author_name TEXT,
            published BOOLEAN DEFAULT false,
            featured BOOLEAN DEFAULT false,
            image_url TEXT,
            tags TEXT[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          RETURN TRUE;
        END;
      `
    });
    
    if (blogPostsError) {
      console.error('Error creating blog_posts table procedure:', blogPostsError.message);
    }
    
    // Create stored procedure for pages table
    const { error: pagesError } = await supabase.rpc('create_function_create_pages_table', {
      function_body: `
        BEGIN
          CREATE TABLE IF NOT EXISTS public.pages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            firebase_id TEXT UNIQUE,
            title TEXT NOT NULL,
            content TEXT,
            slug TEXT UNIQUE,
            meta_description TEXT,
            published BOOLEAN DEFAULT false,
            author_id UUID REFERENCES auth.users(id),
            author_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          RETURN TRUE;
        END;
      `
    });
    
    if (pagesError) {
      console.error('Error creating pages table procedure:', pagesError.message);
    }
    
    // Create stored procedure for donations table
    const { error: donationsError } = await supabase.rpc('create_function_create_donations_table', {
      function_body: `
        BEGIN
          CREATE TABLE IF NOT EXISTS public.donations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            firebase_id TEXT UNIQUE,
            donor_id UUID REFERENCES auth.users(id),
            donor_name TEXT,
            donor_email TEXT,
            amount DECIMAL(10, 2) NOT NULL,
            currency TEXT DEFAULT 'USD',
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            transaction_id TEXT,
            campaign TEXT,
            is_anonymous BOOLEAN DEFAULT false,
            message TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          RETURN TRUE;
        END;
      `
    });
    
    if (donationsError) {
      console.error('Error creating donations table procedure:', donationsError.message);
    }
  } catch (error) {
    console.error('Error creating stored procedures:', error.message);
  }
}

// Execute the migration
migrateContent()
  .then(() => {
    console.log('Content migration process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during content migration:', error);
    process.exit(1);
  });
