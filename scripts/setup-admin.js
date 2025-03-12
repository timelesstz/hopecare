// This script sets up and verifies admin access in Firebase
// Run with: node scripts/setup-admin.js

import { execSync } from 'child_process';
import readline from 'readline';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Function to run a command and return its output
function runCommand(command, silent = false) {
  try {
    if (!silent) {
      console.log(`${colors.cyan}Running: ${colors.yellow}${command}${colors.reset}`);
    }
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) {
      console.log(`${colors.green}Command completed successfully${colors.reset}`);
    }
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      console.error(`${colors.red}Command failed: ${error.message}${colors.reset}`);
    }
    return { success: false, error: error.message };
  }
}

// Main function to run the setup
async function setupAdmin() {
  console.log(`\n${colors.cyan}${colors.bright}=== HopeCare Admin Setup ===${colors.reset}\n`);
  
  // Step 1: Check if Firebase is properly configured
  console.log(`${colors.cyan}Step 1: Checking Firebase configuration...${colors.reset}`);
  const firebaseCheck = runCommand('npm run check:firebase', true);
  
  if (!firebaseCheck.success) {
    console.log(`${colors.red}Firebase configuration check failed. Please check your Firebase setup.${colors.reset}`);
    const continueAnyway = await confirm(`${colors.yellow}Do you want to continue anyway? (y/n) ${colors.reset}`);
    if (!continueAnyway) {
      console.log(`${colors.red}Setup aborted.${colors.reset}`);
      rl.close();
      return;
    }
  } else {
    console.log(`${colors.green}Firebase configuration check passed.${colors.reset}`);
  }
  
  // Step 2: Create admin user
  console.log(`\n${colors.cyan}Step 2: Creating admin user...${colors.reset}`);
  const createAdmin = await confirm(`${colors.yellow}Do you want to create the admin user? (y/n) ${colors.reset}`);
  
  if (createAdmin) {
    const createResult = runCommand('npm run create:admin');
    if (!createResult.success) {
      console.log(`${colors.red}Failed to create admin user. Please check the error message above.${colors.reset}`);
      const continueAnyway = await confirm(`${colors.yellow}Do you want to continue anyway? (y/n) ${colors.reset}`);
      if (!continueAnyway) {
        console.log(`${colors.red}Setup aborted.${colors.reset}`);
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.green}Admin user created successfully.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping admin user creation.${colors.reset}`);
  }
  
  // Step 3: Verify admin access
  console.log(`\n${colors.cyan}Step 3: Verifying admin access...${colors.reset}`);
  const verifyAdmin = await confirm(`${colors.yellow}Do you want to verify admin access? (y/n) ${colors.reset}`);
  
  if (verifyAdmin) {
    const verifyResult = runCommand('npm run verify:admin');
    if (!verifyResult.success) {
      console.log(`${colors.red}Admin verification failed. Please check the error message above.${colors.reset}`);
      const continueAnyway = await confirm(`${colors.yellow}Do you want to continue anyway? (y/n) ${colors.reset}`);
      if (!continueAnyway) {
        console.log(`${colors.red}Setup aborted.${colors.reset}`);
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.green}Admin verification completed successfully.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping admin verification.${colors.reset}`);
  }
  
  // Step 4: Test admin login
  console.log(`\n${colors.cyan}Step 4: Testing admin login...${colors.reset}`);
  const testLogin = await confirm(`${colors.yellow}Do you want to test admin login? (y/n) ${colors.reset}`);
  
  if (testLogin) {
    const loginResult = runCommand('npm run test:admin-login');
    if (!loginResult.success) {
      console.log(`${colors.red}Admin login test failed. Please check the error message above.${colors.reset}`);
      const continueAnyway = await confirm(`${colors.yellow}Do you want to continue anyway? (y/n) ${colors.reset}`);
      if (!continueAnyway) {
        console.log(`${colors.red}Setup aborted.${colors.reset}`);
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.green}Admin login test completed successfully.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping admin login test.${colors.reset}`);
  }
  
  // Step 5: Deploy Firestore security rules
  console.log(`\n${colors.cyan}Step 5: Deploying Firestore security rules...${colors.reset}`);
  const deployRules = await confirm(`${colors.yellow}Do you want to deploy Firestore security rules? (y/n) ${colors.reset}`);
  
  if (deployRules) {
    const rulesResult = runCommand('npm run deploy:firestore-rules');
    if (!rulesResult.success) {
      console.log(`${colors.red}Failed to deploy Firestore security rules. Please check the error message above.${colors.reset}`);
      const continueAnyway = await confirm(`${colors.yellow}Do you want to continue anyway? (y/n) ${colors.reset}`);
      if (!continueAnyway) {
        console.log(`${colors.red}Setup aborted.${colors.reset}`);
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.green}Firestore security rules deployed successfully.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping Firestore security rules deployment.${colors.reset}`);
  }
  
  // Step 6: Summary
  console.log(`\n${colors.cyan}${colors.bright}=== Admin Setup Summary ===${colors.reset}\n`);
  console.log(`${colors.green}✓ Admin user: ${colors.reset}admin@hopecaretz.org`);
  console.log(`${colors.green}✓ Password: ${colors.reset}Hope@admin2`);
  console.log(`${colors.green}✓ Role: ${colors.reset}ADMIN`);
  console.log(`${colors.green}✓ Firestore security rules: ${colors.reset}${deployRules ? 'Deployed' : 'Not deployed'}`);
  
  console.log(`\n${colors.cyan}${colors.bright}=== Next Steps ===${colors.reset}\n`);
  console.log(`${colors.yellow}1. Log in to the application with the admin credentials${colors.reset}`);
  console.log(`${colors.yellow}2. Verify that you can access admin-only features${colors.reset}`);
  console.log(`${colors.yellow}3. Try accessing admin routes with a non-admin user to confirm security${colors.reset}`);
  
  console.log(`\n${colors.green}${colors.bright}Admin setup completed successfully!${colors.reset}\n`);
  
  rl.close();
}

// Run the setup
setupAdmin().catch(error => {
  console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
}); 