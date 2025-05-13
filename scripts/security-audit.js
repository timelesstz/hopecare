// @ts-check
// package.json: { "type": "module" }

/**
 * Supabase Security Audit Script
 * 
 * This script performs a security audit of the Supabase implementation,
 * checking for common security issues and best practices.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('Error: Supabase URL or service key not found in environment variables.'));
  console.log(chalk.yellow('\nPlease check the following:'));
  console.log('1. Make sure your .env file contains the Supabase credentials');
  console.log('2. The following variables should be defined:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Security issues to check
const securityChecks = {
  rls: {
    name: 'Row Level Security',
    description: 'Check if RLS is enabled on all tables',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  },
  apiKeys: {
    name: 'API Key Exposure',
    description: 'Check for API keys in code',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  },
  authentication: {
    name: 'Authentication Settings',
    description: 'Check authentication configuration',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  },
  dataValidation: {
    name: 'Data Validation',
    description: 'Check for proper data validation',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  },
  sqlInjection: {
    name: 'SQL Injection Protection',
    description: 'Check for potential SQL injection vulnerabilities',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  },
  storagePermissions: {
    name: 'Storage Permissions',
    description: 'Check storage bucket permissions',
    status: 'pending',
    details: /** @type {string[]} */ ([])
  }
};

/**
 * Check if RLS is enabled on all tables
 */
async function checkRLS() {
  try {
    console.log(chalk.blue('\nChecking Row Level Security...'));
    
    // Get all tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      throw new Error(`Failed to get tables: ${error.message}`);
    }
    
    if (!tables || tables.length === 0) {
      securityChecks.rls.status = 'warning';
      securityChecks.rls.details.push('No tables found in the public schema');
      return;
    }
    
    // Check RLS for each table
    const rlsIssues = [];
    
    for (const table of tables) {
      const { data: rlsEnabled, error: rlsError } = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', table.table_name)
        .single();
      
      if (rlsError) {
        rlsIssues.push(`Could not check RLS for ${table.table_name}: ${rlsError.message}`);
        continue;
      }
      
      if (!rlsEnabled || !rlsEnabled.rowsecurity) {
        rlsIssues.push(`Table ${table.table_name} does not have RLS enabled`);
      }
    }
    
    if (rlsIssues.length > 0) {
      securityChecks.rls.status = 'fail';
      securityChecks.rls.details = rlsIssues;
    } else {
      securityChecks.rls.status = 'pass';
      securityChecks.rls.details.push(`RLS is enabled on all ${tables.length} tables`);
    }
  } catch (error) {
    securityChecks.rls.status = 'error';
    securityChecks.rls.details.push(`Error checking RLS: ${error.message}`);
  }
}

/**
 * Check for API keys in code
 */
async function checkAPIKeys() {
  try {
    console.log(chalk.blue('\nChecking for API key exposure...'));
    
    const apiKeyPatterns = [
      /supabase.*key.*["']([a-zA-Z0-9.]+)["']/i,
      /SUPABASE.*KEY.*["']([a-zA-Z0-9.]+)["']/i,
      /apiKey.*["']([a-zA-Z0-9.]+)["']/i,
      /API_KEY.*["']([a-zA-Z0-9.]+)["']/i
    ];
    
    const excludeDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      'scripts'
    ];
    
    const issues = [];
    
    // Recursively scan files
    async function scanDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await scanDir(fullPath);
          }
        } else {
          // Only check source files
          const ext = path.extname(fullPath).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            for (const pattern of apiKeyPatterns) {
              const match = content.match(pattern);
              if (match && match[1] && match[1].length > 10) {
                // Skip if it's accessing an environment variable
                if (!content.includes('process.env') && !content.includes('import.meta.env')) {
                  issues.push(`Potential API key found in ${fullPath.replace(projectRoot, '')}`);
                }
              }
            }
          }
        }
      }
    }
    
    await scanDir(path.join(projectRoot, 'src'));
    
    if (issues.length > 0) {
      securityChecks.apiKeys.status = 'fail';
      securityChecks.apiKeys.details = issues;
    } else {
      securityChecks.apiKeys.status = 'pass';
      securityChecks.apiKeys.details.push('No API keys found in code');
    }
  } catch (error) {
    securityChecks.apiKeys.status = 'error';
    securityChecks.apiKeys.details.push(`Error checking API keys: ${error.message}`);
  }
}

/**
 * Check authentication settings
 */
async function checkAuthentication() {
  try {
    console.log(chalk.blue('\nChecking authentication settings...'));
    
    // Check for proper auth context usage
    const authContextPath = path.join(projectRoot, 'src', 'context', 'SupabaseAuthContext.tsx');
    let authContextExists = false;
    
    try {
      await fs.access(authContextPath);
      authContextExists = true;
    } catch (error) {
      // File doesn't exist
    }
    
    if (!authContextExists) {
      securityChecks.authentication.details.push('SupabaseAuthContext.tsx not found');
    } else {
      const content = await fs.readFile(authContextPath, 'utf-8');
      
      // Check for session management
      if (!content.includes('onAuthStateChange') && !content.includes('getSession')) {
        securityChecks.authentication.details.push('Auth context may not be properly managing sessions');
      }
      
      // Check for error handling
      if (!content.includes('try') || !content.includes('catch')) {
        securityChecks.authentication.details.push('Auth context may not have proper error handling');
      }
    }
    
    // Check for auth usage in components
    const srcDir = path.join(projectRoot, 'src');
    const authUsageIssues = [];
    
    async function checkAuthUsage(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await checkAuthUsage(fullPath);
        } else {
          const ext = path.extname(fullPath).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Check for direct Supabase auth usage without context
            if (content.includes('supabase.auth') && 
                !content.includes('useSupabaseAuth') && 
                !content.includes('SupabaseAuthContext') &&
                !fullPath.includes('SupabaseAuthContext.tsx')) {
              authUsageIssues.push(`Direct Supabase auth usage in ${fullPath.replace(projectRoot, '')}`);
            }
          }
        }
      }
    }
    
    await checkAuthUsage(srcDir);
    
    if (authUsageIssues.length > 0) {
      securityChecks.authentication.details.push(...authUsageIssues);
    }
    
    if (securityChecks.authentication.details.length > 0) {
      securityChecks.authentication.status = 'fail';
    } else {
      securityChecks.authentication.status = 'pass';
      securityChecks.authentication.details.push('Authentication implementation looks secure');
    }
  } catch (error) {
    securityChecks.authentication.status = 'error';
    securityChecks.authentication.details.push(`Error checking authentication: ${error.message}`);
  }
}

/**
 * Check for proper data validation
 */
async function checkDataValidation() {
  try {
    console.log(chalk.blue('\nChecking data validation...'));
    
    const srcDir = path.join(projectRoot, 'src');
    const validationIssues = [];
    
    // Look for validation libraries
    let usesZod = false;
    let usesYup = false;
    let usesJoi = false;
    
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      usesZod = !!dependencies.zod;
      usesYup = !!dependencies.yup;
      usesJoi = !!dependencies.joi;
    } catch (error) {
      validationIssues.push('Could not check package.json for validation libraries');
    }
    
    if (!usesZod && !usesYup && !usesJoi) {
      validationIssues.push('No common validation library (zod, yup, joi) found in dependencies');
    }
    
    // Check for validation usage in forms and data submission
    async function checkValidationUsage(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await checkValidationUsage(fullPath);
        } else {
          const ext = path.extname(fullPath).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Check for form submissions without validation
            if ((content.includes('onSubmit') || content.includes('handleSubmit')) && 
                content.includes('supabase.from') &&
                !content.includes('validate') && 
                !content.includes('schema') &&
                !content.includes('yup') && 
                !content.includes('zod') &&
                !content.includes('joi')) {
              validationIssues.push(`Possible form submission without validation in ${fullPath.replace(projectRoot, '')}`);
            }
          }
        }
      }
    }
    
    await checkValidationUsage(srcDir);
    
    if (validationIssues.length > 0) {
      securityChecks.dataValidation.status = 'fail';
      securityChecks.dataValidation.details = validationIssues;
    } else {
      securityChecks.dataValidation.status = 'pass';
      securityChecks.dataValidation.details.push('Data validation looks properly implemented');
    }
  } catch (error) {
    securityChecks.dataValidation.status = 'error';
    securityChecks.dataValidation.details.push(`Error checking data validation: ${error.message}`);
  }
}

/**
 * Check for potential SQL injection vulnerabilities
 */
async function checkSQLInjection() {
  try {
    console.log(chalk.blue('\nChecking for SQL injection vulnerabilities...'));
    
    const srcDir = path.join(projectRoot, 'src');
    const sqlInjectionIssues = [];
    
    async function checkSQLUsage(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await checkSQLUsage(fullPath);
        } else {
          const ext = path.extname(fullPath).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Check for raw SQL queries with string concatenation
            if (content.includes('supabase.rpc') || content.includes('supabase.from')) {
              const lines = content.split('\n');
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if ((line.includes('rpc(') || line.includes('.sql(')) && 
                    (line.includes('${') || line.includes("' +") || line.includes('" +'))) {
                  sqlInjectionIssues.push(`Potential SQL injection in ${fullPath.replace(projectRoot, '')} (line ${i + 1})`);
                }
              }
            }
          }
        }
      }
    }
    
    await checkSQLUsage(srcDir);
    
    if (sqlInjectionIssues.length > 0) {
      securityChecks.sqlInjection.status = 'fail';
      securityChecks.sqlInjection.details = sqlInjectionIssues;
    } else {
      securityChecks.sqlInjection.status = 'pass';
      securityChecks.sqlInjection.details.push('No potential SQL injection vulnerabilities found');
    }
  } catch (error) {
    securityChecks.sqlInjection.status = 'error';
    securityChecks.sqlInjection.details.push(`Error checking SQL injection: ${error.message}`);
  }
}

/**
 * Check storage bucket permissions
 */
async function checkStoragePermissions() {
  try {
    console.log(chalk.blue('\nChecking storage permissions...'));
    
    // Get storage buckets
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      throw new Error(`Failed to list storage buckets: ${error.message}`);
    }
    
    if (!buckets || buckets.length === 0) {
      securityChecks.storagePermissions.status = 'warning';
      securityChecks.storagePermissions.details.push('No storage buckets found');
      return;
    }
    
    const storageIssues = [];
    
    // Check each bucket
    for (const bucket of buckets) {
      // Check if bucket is public
      if (bucket.public) {
        storageIssues.push(`Bucket "${bucket.name}" is public - ensure this is intentional`);
      }
      
      // Try to list files to check permissions
      const { data: files, error: filesError } = await supabase
        .storage
        .from(bucket.name)
        .list();
      
      if (filesError) {
        storageIssues.push(`Error accessing bucket "${bucket.name}": ${filesError.message}`);
      }
    }
    
    // Check for storage policies in code
    const migrationDir = path.join(projectRoot, 'supabase', 'migrations');
    let hasStoragePolicies = false;
    
    try {
      const migrationFiles = await fs.readdir(migrationDir);
      
      for (const file of migrationFiles) {
        if (file.endsWith('.sql')) {
          const content = await fs.readFile(path.join(migrationDir, file), 'utf-8');
          
          if (content.includes('storage.buckets') || content.includes('storage.objects')) {
            hasStoragePolicies = true;
            break;
          }
        }
      }
    } catch (error) {
      // Migration directory might not exist
    }
    
    if (!hasStoragePolicies) {
      storageIssues.push('No storage policies found in migration files');
    }
    
    if (storageIssues.length > 0) {
      securityChecks.storagePermissions.status = 'fail';
      securityChecks.storagePermissions.details = storageIssues;
    } else {
      securityChecks.storagePermissions.status = 'pass';
      securityChecks.storagePermissions.details.push(`Storage permissions look secure for all ${buckets.length} buckets`);
    }
  } catch (error) {
    securityChecks.storagePermissions.status = 'error';
    securityChecks.storagePermissions.details.push(`Error checking storage permissions: ${error.message}`);
  }
}

/**
 * Generate a security report
 */
function generateReport() {
  console.log(chalk.blue('\n=== Supabase Security Audit Report ===\n'));
  
  const statusColors = {
    pass: chalk.green,
    fail: chalk.red,
    warning: chalk.yellow,
    error: chalk.red,
    pending: chalk.gray
  };
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  // Print results for each check
  for (const key in securityChecks) {
    const check = securityChecks[key];
    
    console.log(statusColors[check.status](`${check.name}: ${check.status.toUpperCase()}`));
    console.log(chalk.gray(`${check.description}`));
    
    for (const detail of check.details) {
      console.log(`  ${detail}`);
    }
    
    console.log('');
    
    // Count results
    if (check.status === 'pass') passCount++;
    if (check.status === 'fail') failCount++;
    if (check.status === 'warning') warningCount++;
    if (check.status === 'error') errorCount++;
  }
  
  // Print summary
  console.log(chalk.blue('=== Summary ===\n'));
  console.log(`Total checks: ${Object.keys(securityChecks).length}`);
  console.log(chalk.green(`Passed: ${passCount}`));
  console.log(chalk.red(`Failed: ${failCount}`));
  console.log(chalk.yellow(`Warnings: ${warningCount}`));
  console.log(chalk.red(`Errors: ${errorCount}`));
  
  // Print recommendations
  if (failCount > 0 || warningCount > 0 || errorCount > 0) {
    console.log(chalk.blue('\n=== Recommendations ===\n'));
    
    if (securityChecks.rls.status === 'fail') {
      console.log('1. Enable Row Level Security on all tables:');
      console.log('   ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;');
      console.log('   Then create appropriate policies for each table.');
    }
    
    if (securityChecks.apiKeys.status === 'fail') {
      console.log('2. Remove hardcoded API keys from code:');
      console.log('   - Use environment variables for all API keys');
      console.log('   - Never commit API keys to version control');
    }
    
    if (securityChecks.authentication.status === 'fail') {
      console.log('3. Improve authentication security:');
      console.log('   - Use the SupabaseAuthContext consistently');
      console.log('   - Implement proper session management');
      console.log('   - Add error handling for auth operations');
    }
    
    if (securityChecks.dataValidation.status === 'fail') {
      console.log('4. Implement proper data validation:');
      console.log('   - Use a validation library like zod, yup, or joi');
      console.log('   - Validate all user inputs before submission');
      console.log('   - Add server-side validation with RLS policies');
    }
    
    if (securityChecks.sqlInjection.status === 'fail') {
      console.log('5. Fix potential SQL injection vulnerabilities:');
      console.log('   - Use parameterized queries instead of string concatenation');
      console.log('   - Use the Supabase query builder instead of raw SQL when possible');
    }
    
    if (securityChecks.storagePermissions.status === 'fail') {
      console.log('6. Secure storage buckets:');
      console.log('   - Implement RLS policies for storage');
      console.log('   - Make buckets private unless they need to be public');
      console.log('   - Use signed URLs for temporary access to files');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('=== Supabase Security Audit ==='));
  console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}`));
  console.log(chalk.gray(`Project root: ${projectRoot}`));
  console.log(chalk.gray(`Supabase URL: ${supabaseUrl}`));
  
  try {
    // Run all checks
    await checkRLS();
    await checkAPIKeys();
    await checkAuthentication();
    await checkDataValidation();
    await checkSQLInjection();
    await checkStoragePermissions();
    
    // Generate report
    generateReport();
    
    // Save report to file
    const reportPath = path.join(projectRoot, 'security-audit-report.md');
    
    let reportContent = '# Supabase Security Audit Report\n\n';
    reportContent += `Generated at: ${new Date().toLocaleString()}\n\n`;
    
    for (const key in securityChecks) {
      const check = securityChecks[key];
      
      reportContent += `## ${check.name}: ${check.status.toUpperCase()}\n\n`;
      reportContent += `${check.description}\n\n`;
      
      for (const detail of check.details) {
        reportContent += `- ${detail}\n`;
      }
      
      reportContent += '\n';
    }
    
    await fs.writeFile(reportPath, reportContent);
    console.log(chalk.blue(`\nReport saved to: ${reportPath}`));
    
  } catch (error) {
    console.error(chalk.red(`\nError running security audit: ${error.message}`));
    console.error(error.stack);
  }
  
  console.log(chalk.blue('\n=== Audit Complete ==='));
  console.log(chalk.gray(`Finished at: ${new Date().toLocaleString()}`));
}

// Run the script
main().catch(console.error);
