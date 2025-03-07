// This script helps clean up Supabase dependencies after migration to Firebase
// Run with: node scripts/cleanup-supabase.js

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Paths to check and clean
const SRC_DIR = path.resolve(process.cwd(), 'src');
const SUPABASE_FILES = [
  'src/lib/supabase.ts',
  'src/lib/supabaseClient.ts',
  'src/context/AuthContext.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'src/utils/testSupabase.ts',
  'src/services/supabaseService.ts',
  'src/types/supabase.ts'
];

// Supabase dependencies to remove from package.json
const SUPABASE_DEPENDENCIES = [
  '@supabase/supabase-js',
  '@supabase/auth-helpers-react',
  '@supabase/auth-helpers-nextjs',
  '@supabase/auth-ui-react',
  '@supabase/auth-ui-shared'
];

// Supabase environment variables to remove from .env files
const SUPABASE_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_KEY'
];

// Function to find all files in a directory recursively
async function findFiles(dir, pattern) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const result = [];

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      result.push(...await findFiles(filePath, pattern));
    } else if (pattern.test(file.name)) {
      result.push(filePath);
    }
  }

  return result;
}

// Function to check if a file contains Supabase references
async function containsSupabaseReferences(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return /supabase|Supabase|SUPABASE/.test(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

// Function to remove Supabase files
async function removeSupabaseFiles() {
  console.log('Removing Supabase files...');
  
  for (const filePath of SUPABASE_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

// Function to find files with Supabase references
async function findSupabaseReferences() {
  console.log('Finding files with Supabase references...');
  
  const tsFiles = await findFiles(SRC_DIR, /\.(ts|tsx|js|jsx)$/);
  const filesWithReferences = [];
  
  for (const filePath of tsFiles) {
    if (await containsSupabaseReferences(filePath)) {
      filesWithReferences.push(filePath);
    }
  }
  
  return filesWithReferences;
}

// Function to update package.json
async function updatePackageJson() {
  console.log('Updating package.json...');
  
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
    
    let modified = false;
    
    // Remove Supabase dependencies
    for (const dep of SUPABASE_DEPENDENCIES) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        delete packageJson.dependencies[dep];
        console.log(`Removed dependency: ${dep}`);
        modified = true;
      }
      
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        delete packageJson.devDependencies[dep];
        console.log(`Removed dev dependency: ${dep}`);
        modified = true;
      }
    }
    
    if (modified) {
      await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json');
    } else {
      console.log('No Supabase dependencies found in package.json');
    }
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

// Function to update .env files
async function updateEnvFiles() {
  console.log('Updating .env files...');
  
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    
    if (fs.existsSync(envPath)) {
      try {
        let envContent = await fs.promises.readFile(envPath, 'utf8');
        let modified = false;
        
        for (const envVar of SUPABASE_ENV_VARS) {
          const regex = new RegExp(`^${envVar}=.*$`, 'gm');
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `# REMOVED: ${envVar}`);
            console.log(`Commented out ${envVar} in ${envFile}`);
            modified = true;
          }
        }
        
        if (modified) {
          await fs.promises.writeFile(envPath, envContent);
          console.log(`Updated ${envFile}`);
        } else {
          console.log(`No Supabase environment variables found in ${envFile}`);
        }
      } catch (error) {
        console.error(`Error updating ${envFile}:`, error);
      }
    }
  }
}

// Main function
async function cleanup() {
  try {
    console.log('Starting Supabase cleanup...');
    
    // Find files with Supabase references
    const filesWithReferences = await findSupabaseReferences();
    
    if (filesWithReferences.length > 0) {
      console.log('\nFiles with Supabase references:');
      filesWithReferences.forEach(file => console.log(`- ${file}`));
      console.log('\nPlease review these files and update them to use Firebase instead.');
    } else {
      console.log('No files with Supabase references found.');
    }
    
    // Remove Supabase files
    await removeSupabaseFiles();
    
    // Update package.json
    await updatePackageJson();
    
    // Update .env files
    await updateEnvFiles();
    
    console.log('\nCleanup completed!');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to update node_modules');
    console.log('2. Review and update any remaining files with Supabase references');
    console.log('3. Test the application to ensure everything works with Firebase');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run the cleanup
cleanup(); 