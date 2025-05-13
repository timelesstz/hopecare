/**
 * Supabase Migration Script
 * 
 * This script applies all SQL migrations in the migrations folder to the Supabase database.
 * It reads the migration files in order and executes them against the Supabase database.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

// Create Supabase client with service role key (for admin operations)
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migrations folder
const migrationsPath = path.join(__dirname, '..', 'migrations');

/**
 * Apply a single migration file
 * @param {string} filePath - Path to the migration file
 * @param {string} fileName - Name of the migration file
 * @returns {Promise<boolean>} - Whether the migration was successful
 */
async function applyMigration(filePath, fileName) {
  try {
    console.log(`Applying migration: ${fileName}`);
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the SQL against Supabase
    const { error } = await supabase.rpc('pgmigrate', { query: sql });
    
    if (error) {
      console.error(`Error applying migration ${fileName}:`, error);
      return false;
    }
    
    console.log(`Successfully applied migration: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error processing migration ${fileName}:`, error);
    return false;
  }
}

/**
 * Apply all migrations in order
 */
async function applyMigrations() {
  try {
    // Check if migrations folder exists
    if (!fs.existsSync(migrationsPath)) {
      console.error(`Migrations folder not found at ${migrationsPath}`);
      return;
    }
    
    // Get all SQL files in the migrations folder
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order
    
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    console.log(`Found ${files.length} migration files.`);
    
    // Apply migrations in sequence
    let successCount = 0;
    let failCount = 0;
    
    for (const file of files) {
      const filePath = path.join(migrationsPath, file);
      const success = await applyMigration(filePath, file);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
        // Consider whether to continue or stop on failure
        if (process.env.STOP_ON_MIGRATION_FAILURE === 'true') {
          console.error('Stopping migrations due to failure.');
          break;
        }
      }
    }
    
    console.log(`Migration complete. Success: ${successCount}, Failed: ${failCount}`);
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

// Create a custom RPC function in Supabase to execute raw SQL
async function createPgMigrateFunction() {
  try {
    console.log('Creating pgmigrate function...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION pgmigrate(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('pgmigrate', { 
      query: createFunctionSQL 
    }).catch(() => {
      // If the function doesn't exist yet, execute it directly
      return supabase.from('_rpc').select('*').rpc('pgmigrate', { 
        query: createFunctionSQL 
      });
    });
    
    if (error) {
      console.error('Error creating pgmigrate function:', error);
      // Try direct SQL execution as fallback
      const { error: directError } = await supabase.rpc('exec', { sql: createFunctionSQL });
      if (directError) {
        console.error('Error creating pgmigrate function via direct execution:', directError);
        return false;
      }
    }
    
    console.log('Successfully created pgmigrate function');
    return true;
  } catch (error) {
    console.error('Error setting up migration function:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Supabase migration...');
  
  // Create the pgmigrate function if it doesn't exist
  const setupSuccess = await createPgMigrateFunction();
  if (!setupSuccess) {
    console.error('Failed to set up migration function. Aborting.');
    return;
  }
  
  // Apply migrations
  await applyMigrations();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error in migration script:', error);
  process.exit(1);
});
