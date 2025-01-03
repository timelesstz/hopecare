import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
  try {
    console.log('Starting database migration...');

    const migrationPath = path.join(__dirname, '../supabase/migrations/20231211_create_donations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      throw error;
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
