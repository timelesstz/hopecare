/**
 * Task Status Updater
 * 
 * This script automatically updates the tasks.md file based on code changes
 * and commit messages. It looks for specific patterns in commit messages and
 * code to determine which tasks have been completed.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const TASKS_FILE = path.join(__dirname, '..', 'docs', 'tasks.md');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Task patterns to look for in code
const TASK_PATTERNS = [
  {
    name: 'Supabase Authentication',
    pattern: 'supabase.auth',
    files: ['src/contexts/AuthContext.tsx'],
    taskId: 'auth-core'
  },
  {
    name: 'Firebase Auth Compatibility',
    pattern: 'FirebaseAuthContext',
    files: ['src/context/FirebaseAuthContext.tsx'],
    taskId: 'auth-compatibility'
  },
  {
    name: 'Supabase Configuration',
    pattern: 'createClient<Database>',
    files: ['src/lib/supabase.ts'],
    taskId: 'database-config'
  },
  {
    name: 'Analytics Compatibility',
    pattern: 'logEvent',
    files: ['src/firebase/analytics.ts'],
    taskId: 'analytics-compatibility'
  },
  {
    name: 'Donate Page Update',
    pattern: 'useFlutterwave',
    files: ['src/pages/Donate.tsx'],
    taskId: 'donation-payment'
  }
];

// Read the tasks file
function readTasksFile() {
  try {
    return fs.readFileSync(TASKS_FILE, 'utf8');
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return null;
  }
}

// Write updated tasks file
function writeTasksFile(content) {
  try {
    fs.writeFileSync(TASKS_FILE, content, 'utf8');
    console.log('Tasks file updated successfully');
    return true;
  } catch (error) {
    console.error('Error writing tasks file:', error);
    return false;
  }
}

// Check if a file contains a pattern
function fileContainsPattern(filePath, pattern) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(pattern);
  } catch (error) {
    console.error(`Error checking pattern in ${filePath}:`, error);
    return false;
  }
}

// Update task status in the tasks file
function updateTaskStatus(content, taskId, completed) {
  // Look for the task pattern in the content
  const taskRegex = new RegExp(`- \\[([ x])\\].*#.*${taskId}`, 'g');
  
  if (completed) {
    // Mark the task as completed
    return content.replace(taskRegex, '- [x]$`');
  } else {
    // Mark the task as pending
    return content.replace(taskRegex, '- [ ]$`');
  }
}

// Calculate overall progress
function calculateProgress(content) {
  const sections = [
    { name: 'Authentication', pattern: '## Authentication Migration', startIndex: 0, endIndex: 0 },
    { name: 'Database Migration', pattern: '## Database Migration', startIndex: 0, endIndex: 0 },
    { name: 'Feature Migration', pattern: '## Feature Migration', startIndex: 0, endIndex: 0 },
    { name: 'Infrastructure', pattern: '## Infrastructure and Configuration', startIndex: 0, endIndex: 0 }
  ];
  
  const progressSection = '## Progress Summary';
  let progressContent = `${progressSection}\n`;
  
  // Find section boundaries first
  const lines = content.split('\n');
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a new section
    for (const section of sections) {
      if (line.trim() === section.pattern) {
        section.startIndex = i;
        currentSection = section;
      }
    }
    
    // Check if this line starts another section (ending the current one)
    if (currentSection && line.startsWith('##') && !line.includes(currentSection.pattern)) {
      currentSection.endIndex = i - 1;
      currentSection = null;
    }
  }
  
  // Set end index for the last section if it wasn't set
  if (currentSection && currentSection.endIndex === 0) {
    currentSection.endIndex = lines.length - 1;
  }
  
  // Count completed tasks in each section
  sections.forEach(section => {
    if (section.startIndex === 0) {
      console.warn(`Section pattern "${section.pattern}" not found in content`);
      progressContent += `- **${section.name}**: 0% complete\n`;
      return;
    }
    
    // Get all lines in this section
    const sectionLines = lines.slice(section.startIndex, section.endIndex + 1);
    
    // Count top-level tasks only (ignoring nested tasks)
    const taskLines = sectionLines.filter(line => line.trim().startsWith('- [') && !line.trim().startsWith('  - ['));
    const totalTasks = taskLines.length;
    const completedTasks = taskLines.filter(line => line.includes('- [x]')).length;
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    console.log(`${section.name}: ${completedTasks}/${totalTasks} tasks completed (${percentage}%)`);
    progressContent += `- **${section.name}**: ${percentage}% complete\n`;
  });
  
  // Calculate overall progress
  const taskLines = content.split('\n').filter(line => line.trim().startsWith('- [') && !line.trim().startsWith('  - ['));
  const totalTasks = taskLines.length;
  const completedTasks = taskLines.filter(line => line.includes('- [x]')).length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  console.log(`Overall: ${completedTasks}/${totalTasks} tasks completed (${overallPercentage}%)`);
  progressContent += `- **Overall Progress**: ~${overallPercentage}% complete`;
  
  // Replace the progress section in the content
  const progressStart = content.indexOf(progressSection);
  if (progressStart === -1) {
    console.warn('Progress summary section not found in content');
    return content + '\n' + progressContent;
  }
  
  // Find the end of the progress section
  const nextSectionStart = content.indexOf('##', progressStart + progressSection.length);
  const progressEnd = nextSectionStart !== -1 ? nextSectionStart : content.length;
  
  return content.substring(0, progressStart) + progressContent + 
         (nextSectionStart !== -1 ? content.substring(progressEnd) : '');
}

// Main function
const main = () => {
  // Read the tasks file
  const tasksContent = readTasksFile();
  if (!tasksContent) {
    return;
  }
  
  let updatedContent = tasksContent;
  
  // Check each task pattern
  TASK_PATTERNS.forEach(task => {
    const allPatternsFound = task.files.every(file => {
      const filePath = path.join(__dirname, '..', file);
      return fileContainsPattern(filePath, task.pattern);
    });
    
    if (allPatternsFound) {
      console.log(`Task "${task.name}" completed`);
      updatedContent = updateTaskStatus(updatedContent, task.taskId, true);
    } else {
      console.log(`Task "${task.name}" pending`);
      updatedContent = updateTaskStatus(updatedContent, task.taskId, false);
    }
  });
  
  // Calculate and update progress
  updatedContent = calculateProgress(updatedContent);
  
  // Write the updated content
  writeTasksFile(updatedContent);
};

// Run the main function
main();
