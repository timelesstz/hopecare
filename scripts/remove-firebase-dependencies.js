// @ts-check
// package.json: { "type": "module" }

/**
 * Firebase Dependency Removal Script
 * 
 * This script helps identify and remove Firebase dependencies from the codebase.
 * It scans the project for Firebase imports and usage, and provides guidance
 * on how to replace them with Supabase equivalents.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Firebase packages to look for
const firebasePackages = [
  'firebase',
  'firebase/app',
  'firebase/auth',
  'firebase/firestore',
  'firebase/storage',
  'firebase/analytics',
  'firebase/functions',
  'firebase-admin'
];

// Files and directories to exclude
const excludeDirs = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'scripts',
  'public'
];

/**
 * Check if a file should be scanned
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file should be scanned
 */
function shouldScanFile(filePath) {
  // Only scan JavaScript, TypeScript, and JSX/TSX files
  const ext = path.extname(filePath).toLowerCase();
  const validExts = ['.js', '.jsx', '.ts', '.tsx'];
  
  if (!validExts.includes(ext)) {
    return false;
  }
  
  // Skip files in excluded directories
  for (const dir of excludeDirs) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Scan a file for Firebase imports and usage
 * @param {string} filePath - Path to the file
 * @returns {Promise<{filePath: string, imports: string[], usages: string[]}>} - Firebase imports and usages
 */
async function scanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const imports = [];
    const usages = [];
    
    // Check for imports
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for import statements
      if (trimmedLine.startsWith('import ') || trimmedLine.includes(' from ')) {
        for (const pkg of firebasePackages) {
          if (trimmedLine.includes(`'${pkg}'`) || trimmedLine.includes(`"${pkg}"`)) {
            imports.push(trimmedLine);
            break;
          }
        }
      }
      
      // Check for Firebase usage
      if (trimmedLine.includes('firebase.') || 
          trimmedLine.includes('firestore.') || 
          trimmedLine.includes('auth.') ||
          trimmedLine.includes('getFirestore') ||
          trimmedLine.includes('getAuth') ||
          trimmedLine.includes('collection(') ||
          trimmedLine.includes('doc(') ||
          trimmedLine.includes('query(') ||
          trimmedLine.includes('where(') ||
          trimmedLine.includes('orderBy(')) {
        usages.push(trimmedLine);
      }
    }
    
    return { filePath, imports, usages };
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return { filePath, imports: [], usages: [] };
  }
}

/**
 * Recursively scan a directory for files
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} - List of file paths
 */
async function scanDir(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          const subFiles = await scanDir(fullPath);
          files.push(...subFiles);
        }
      } else if (shouldScanFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Generate a report of Firebase dependencies
 * @param {Array<{filePath: string, imports: string[], usages: string[]}>} results - Scan results
 */
function generateReport(results) {
  const filesWithDependencies = results.filter(r => r.imports.length > 0 || r.usages.length > 0);
  
  console.log(chalk.blue('\n=== Firebase Dependency Report ===\n'));
  console.log(chalk.gray(`Scanned ${results.length} files`));
  console.log(chalk.yellow(`Found ${filesWithDependencies.length} files with Firebase dependencies\n`));
  
  if (filesWithDependencies.length === 0) {
    console.log(chalk.green('No Firebase dependencies found! The migration is complete.'));
    return;
  }
  
  // Group by directory for better organization
  const filesByDir = {};
  
  for (const result of filesWithDependencies) {
    const dir = path.dirname(result.filePath);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(result);
  }
  
  // Print results by directory
  for (const dir in filesByDir) {
    console.log(chalk.cyan(`\nDirectory: ${dir.replace(projectRoot, '')}`));
    
    for (const result of filesByDir[dir]) {
      const relativePath = result.filePath.replace(projectRoot, '');
      console.log(chalk.white(`\nFile: ${relativePath}`));
      
      if (result.imports.length > 0) {
        console.log(chalk.yellow('  Imports:'));
        for (const imp of result.imports) {
          console.log(`    ${imp}`);
        }
      }
      
      if (result.usages.length > 0) {
        console.log(chalk.yellow('  Usages:'));
        for (const usage of result.usages) {
          console.log(`    ${usage}`);
        }
      }
    }
  }
  
  // Print recommendations
  console.log(chalk.blue('\n=== Recommendations ===\n'));
  console.log('1. Replace Firebase imports with Supabase equivalents:');
  console.log('   - import { createClient } from \'@supabase/supabase-js\'');
  console.log('   - const supabase = createClient(supabaseUrl, supabaseKey)');
  console.log('\n2. Replace Firestore operations:');
  console.log('   - collection() → supabase.from()');
  console.log('   - doc() → supabase.from().select().eq(\'id\', id)');
  console.log('   - query() with where() → supabase.from().select().eq()/.gt()/.lt() etc.');
  console.log('   - orderBy() → supabase.from().select().order()');
  console.log('\n3. Replace Firebase Auth:');
  console.log('   - signInWithEmailAndPassword() → supabase.auth.signInWithPassword()');
  console.log('   - createUserWithEmailAndPassword() → supabase.auth.signUp()');
  console.log('   - signOut() → supabase.auth.signOut()');
  console.log('\n4. Update context providers:');
  console.log('   - Replace FirebaseAuthContext with SupabaseAuthContext');
  console.log('   - Update components to use the new context');
  
  console.log(chalk.blue('\n=== Next Steps ===\n'));
  console.log('1. Start by replacing the imports in each file');
  console.log('2. Update the authentication logic first');
  console.log('3. Then migrate database operations');
  console.log('4. Test each component after migration');
  console.log('5. Run this script again to check progress');
}

/**
 * Check package.json for Firebase dependencies
 */
async function checkPackageJson() {
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const firebaseDeps = Object.keys(dependencies).filter(dep => 
      dep === 'firebase' || 
      dep.startsWith('firebase-') || 
      dep.startsWith('@firebase/')
    );
    
    if (firebaseDeps.length > 0) {
      console.log(chalk.blue('\n=== Firebase Package Dependencies ===\n'));
      console.log('The following Firebase packages are installed:');
      
      for (const dep of firebaseDeps) {
        console.log(`- ${dep}: ${dependencies[dep]}`);
      }
      
      console.log('\nTo remove these dependencies, run:');
      console.log(chalk.yellow(`npm uninstall ${firebaseDeps.join(' ')}`));
    } else {
      console.log(chalk.green('\nNo Firebase packages found in package.json'));
    }
  } catch (error) {
    console.error('Error checking package.json:', error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('=== Firebase Dependency Removal Tool ==='));
  console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}`));
  console.log(chalk.gray(`Project root: ${projectRoot}`));
  
  // Scan for files
  console.log(chalk.yellow('\nScanning project for files...'));
  const files = await scanDir(projectRoot);
  console.log(chalk.green(`Found ${files.length} files to scan`));
  
  // Scan files for Firebase dependencies
  console.log(chalk.yellow('\nScanning files for Firebase dependencies...'));
  const results = [];
  
  for (const file of files) {
    const result = await scanFile(file);
    if (result.imports.length > 0 || result.usages.length > 0) {
      results.push(result);
    }
  }
  
  // Generate report
  generateReport(results);
  
  // Check package.json
  await checkPackageJson();
  
  console.log(chalk.blue('\n=== Scan Complete ==='));
  console.log(chalk.gray(`Finished at: ${new Date().toLocaleString()}`));
}

// Run the script
main().catch(console.error);
