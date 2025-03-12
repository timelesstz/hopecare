#!/usr/bin/env node

/**
 * Final cleanup script for Supabase to Firebase migration
 * 
 * This script:
 * 1. Removes any remaining Supabase references from the codebase
 * 2. Cleans up environment variables
 * 3. Removes Supabase dependencies from package.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}Starting final cleanup for Firebase migration...${colors.reset}`);

// 1. Find and remove any remaining Supabase references
console.log(`\n${colors.yellow}Searching for remaining Supabase references...${colors.reset}`);

const findSupabaseReferences = () => {
  try {
    const result = execSync('grep -r "supabase\\|@supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src').toString();
    return result.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    // If grep doesn't find anything, it returns a non-zero exit code
    if (error.status === 1 && error.stdout.toString().trim() === '') {
      return [];
    }
    console.error(`${colors.red}Error searching for Supabase references:${colors.reset}`, error);
    return [];
  }
};

const supabaseReferences = findSupabaseReferences();

if (supabaseReferences.length > 0) {
  console.log(`${colors.yellow}Found ${supabaseReferences.length} Supabase references:${colors.reset}`);
  supabaseReferences.forEach(ref => console.log(`- ${ref}`));
  
  console.log(`\n${colors.yellow}Removing Supabase references...${colors.reset}`);
  
  // Common patterns to replace
  const replacements = [
    {
      pattern: /import\s+.*\s+from\s+['"]@supabase\/supabase-js['"]/g,
      replacement: '// Removed Supabase import'
    },
    {
      pattern: /import\s+.*\s+from\s+['"]@supabase\/auth-helpers-react['"]/g,
      replacement: '// Removed Supabase auth helpers import'
    },
    {
      pattern: /import\s+\{\s*supabase\s*\}\s+from\s+['"]\.\.\/.*\/supabase['"]/g,
      replacement: '// Removed Supabase client import'
    },
    {
      pattern: /const\s+\{\s*data.*error\s*\}\s*=\s*await\s*supabase\./g,
      replacement: '// Removed Supabase query - replaced with Firebase'
    }
  ];
  
  // Process each file with Supabase references
  const processedFiles = new Set();
  
  supabaseReferences.forEach(ref => {
    const filePath = ref.split(':')[0];
    if (processedFiles.has(filePath)) return;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`${colors.green}Updated ${filePath}${colors.reset}`);
        processedFiles.add(filePath);
      }
    } catch (error) {
      console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error);
    }
  });
} else {
  console.log(`${colors.green}No Supabase references found in the codebase.${colors.reset}`);
}

// 2. Clean up environment variables
console.log(`\n${colors.yellow}Cleaning up environment variables...${colors.reset}`);

const envFiles = [
  '.env',
  '.env.development',
  '.env.production',
  '.env.local',
  '.env.development.local',
  '.env.production.local'
];

envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  
  if (fs.existsSync(envPath)) {
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Remove Supabase environment variables
      envContent = envContent.replace(/^VITE_SUPABASE_URL=.*$/gm, '# REMOVED: VITE_SUPABASE_URL');
      envContent = envContent.replace(/^VITE_SUPABASE_ANON_KEY=.*$/gm, '# REMOVED: VITE_SUPABASE_ANON_KEY');
      envContent = envContent.replace(/^VITE_SUPABASE_SERVICE_KEY=.*$/gm, '# REMOVED: VITE_SUPABASE_SERVICE_KEY');
      
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log(`${colors.green}Updated ${envFile}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error updating ${envFile}:${colors.reset}`, error);
    }
  }
});

// 3. Remove Supabase dependencies from package.json
console.log(`\n${colors.yellow}Removing Supabase dependencies from package.json...${colors.reset}`);

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const supabaseDependencies = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-react',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-ui-react',
    '@supabase/auth-ui-shared'
  ];
  
  let dependenciesRemoved = false;
  
  if (packageJson.dependencies) {
    supabaseDependencies.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`${colors.green}Removing dependency: ${dep}${colors.reset}`);
        delete packageJson.dependencies[dep];
        dependenciesRemoved = true;
      }
    });
  }
  
  if (packageJson.devDependencies) {
    supabaseDependencies.forEach(dep => {
      if (packageJson.devDependencies[dep]) {
        console.log(`${colors.green}Removing dev dependency: ${dep}${colors.reset}`);
        delete packageJson.devDependencies[dep];
        dependenciesRemoved = true;
      }
    });
  }
  
  if (dependenciesRemoved) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`${colors.green}Updated package.json${colors.reset}`);
    
    console.log(`\n${colors.yellow}Running npm install to update node_modules...${colors.reset}`);
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log(`${colors.green}No Supabase dependencies found in package.json.${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error updating package.json:${colors.reset}`, error);
}

console.log(`\n${colors.cyan}Final cleanup completed!${colors.reset}`);
console.log(`\n${colors.green}Next steps:${colors.reset}`);
console.log(`1. Run the test suite: ${colors.cyan}npm test${colors.reset}`);
console.log(`2. Verify the application works correctly with Firebase`);
console.log(`3. Deploy the application with the Firebase configuration`); 