// This script helps identify and replace common Supabase patterns with Firebase equivalents
// Run with: node scripts/replace-supabase-refs.js

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Files that were flagged as containing Supabase references
const flaggedFiles = [
  'src/components/admin/ContentEditor.tsx',
  'src/components/admin/MediaLibrary.tsx',
  'src/components/admin/PageManager.tsx',
  'src/components/FirestoreExample.tsx',
  'src/components/user/ProfileEditor.tsx',
  'src/components/volunteer/VolunteerAvailability.tsx',
  'src/context/CMSContext.tsx',
  'src/context/__tests__/DonationContext.test.tsx',
  'src/contexts/AuthContext.tsx',
  'src/hooks/useAuth.tsx',
  'src/lib/analytics-service.ts',
  'src/lib/analytics.ts',
  'src/lib/donation-service.ts',
  'src/middleware/auth.ts',
  'src/middleware/security.ts',
  'src/pages/admin/AdminLogin.tsx',
  'src/pages/admin/MediaLibrary.tsx',
  'src/pages/admin/UserManagement.tsx',
  'src/pages/admin/VerifyEmail.tsx',
  'src/pages/admin/__tests__/AdminLogin.test.tsx',
  'src/pages/api/webhooks/flutterwave.ts',
  'src/pages/api/webhooks/resend.ts',
  'src/pages/Donate.tsx',
  'src/pages/ForgotPassword.tsx',
  'src/pages/ResetPassword.tsx',
  'src/services/accountService.ts',
  'src/services/adminService.ts',
  'src/services/analyticsService.ts',
  'src/services/api/payment.ts',
  'src/services/authService.ts',
  'src/services/emailService.ts',
  'src/services/logService.ts',
  'src/services/userService.ts',
  'src/services/volunteerService.ts',
  'src/tests/utils.tsx',
  'src/utils/errorLogger.ts',
  'src/utils/firestoreUtils.ts',
  'src/utils/imageProcessor.ts'
];

// Common Supabase import patterns to replace
const importReplacements = [
  {
    pattern: /import\s+.*\s+from\s+['"]@supabase\/supabase-js['"]/g,
    replacement: '// Supabase import removed - using Firebase instead'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]@supabase\/auth-helpers-react['"]/g,
    replacement: '// Supabase auth helpers import removed - using Firebase instead'
  },
  {
    pattern: /import\s+\{\s*supabase\s*\}\s+from\s+['"]\.\.\/.*\/supabase['"]/g,
    replacement: '// Supabase client import removed - using Firebase instead\nimport { db, auth } from \'../lib/firebase\''
  },
  {
    pattern: /import\s+\{\s*useAuth\s*\}\s+from\s+['"]\.\.\/contexts\/AuthContext['"]/g,
    replacement: 'import { useFirebaseAuth } from \'../context/FirebaseAuthContext\''
  }
];

// Common Supabase usage patterns to replace
const usageReplacements = [
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.from\(['"](.*?)['"].*?\)\.select\((.*?)\)/g,
    replacement: (match, table, select) => {
      return `const { data, error } = await firestoreUtils.getAll('${table}', { select: ${select} })`;
    }
  },
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.from\(['"](.*?)['"].*?\)\.insert\((.*?)\)/g,
    replacement: (match, table, data) => {
      return `const { data, error } = await firestoreUtils.create('${table}', ${data})`;
    }
  },
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.from\(['"](.*?)['"].*?\)\.update\((.*?)\)/g,
    replacement: (match, table, data) => {
      return `const { data, error } = await firestoreUtils.update('${table}', id, ${data})`;
    }
  },
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.from\(['"](.*?)['"].*?\)\.delete\(\)/g,
    replacement: (match, table) => {
      return `const { data, error } = await firestoreUtils.remove('${table}', id)`;
    }
  },
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.auth\.signInWithPassword\((.*?)\)/g,
    replacement: (match, args) => {
      return `try {\n  await signInWithEmailAndPassword(auth, email, password);\n  // Get user data from Firestore\n  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));\n  const userData = userDoc.exists() ? userDoc.data() : null;\n} catch (error) {\n  console.error('Login error:', error);\n}`;
    }
  },
  {
    pattern: /const\s+\{\s*data\s*(?:,\s*error)?\s*\}\s*=\s*await\s+supabase\.auth\.signUp\((.*?)\)/g,
    replacement: (match, args) => {
      return `try {\n  const userCredential = await createUserWithEmailAndPassword(auth, email, password);\n  // Create user profile in Firestore\n  await setDoc(doc(db, 'users', userCredential.user.uid), {\n    email,\n    // Add other user data here\n    created_at: new Date().toISOString(),\n    updated_at: new Date().toISOString()\n  });\n} catch (error) {\n  console.error('Registration error:', error);\n}`;
    }
  },
  {
    pattern: /await\s+supabase\.auth\.signOut\(\)/g,
    replacement: 'await signOut(auth)'
  },
  {
    pattern: /useAuth\(\)/g,
    replacement: 'useFirebaseAuth()'
  }
];

// Function to process a file
async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Read the file
    const content = await readFile(filePath, 'utf8');
    
    // Apply replacements
    let newContent = content;
    
    // Apply import replacements
    for (const replacement of importReplacements) {
      newContent = newContent.replace(replacement.pattern, replacement.replacement);
    }
    
    // Apply usage replacements
    for (const replacement of usageReplacements) {
      if (typeof replacement.replacement === 'function') {
        newContent = newContent.replace(replacement.pattern, replacement.replacement);
      } else {
        newContent = newContent.replace(replacement.pattern, replacement.replacement);
      }
    }
    
    // Add Firebase imports if they're not already there
    if (newContent.includes('firestoreUtils') && !newContent.includes('import * as firestoreUtils')) {
      newContent = `import * as firestoreUtils from '../utils/firestoreUtils';\n${newContent}`;
    }
    
    if (newContent.includes('signInWithEmailAndPassword') && !newContent.includes('import { signInWithEmailAndPassword }')) {
      newContent = `import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';\nimport { doc, getDoc, setDoc } from 'firebase/firestore';\n${newContent}`;
    }
    
    // Write the file if changes were made
    if (newContent !== content) {
      await writeFile(filePath, newContent);
      console.log(`Updated ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting to replace Supabase references with Firebase equivalents...');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const filePath of flaggedFiles) {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const updated = await processFile(fullPath);
        if (updated) {
          updatedCount++;
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\nReplacement complete!`);
  console.log(`Updated ${updatedCount} files`);
  console.log(`Encountered errors in ${errorCount} files`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the updated files to ensure the replacements are correct`);
  console.log(`2. Manually update any complex Supabase patterns that weren't caught by this script`);
  console.log(`3. Test the application to ensure everything works with Firebase`);
}

main().catch(console.error); 