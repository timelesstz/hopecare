import { 
  toISOString, 
  toDate, 
  formatTimestamp, 
  isValidTimestamp,
  getCurrentTimestamp,
  getCurrentISOString
} from '../utils/timestampUtils';

import {
  ErrorType,
  handleError,
  createErrorHandler
} from '../utils/errorUtils';

import {
  sanitizeHtml,
  createSafeHtml,
  stripHtml,
  truncateHtml
} from '../utils/htmlUtils';

import {
  getEnvVar,
  getBooleanEnvVar,
  getNumberEnvVar,
  getJsonEnvVar
} from '../utils/envUtils';

/**
 * Utility Functions Test Suite
 * 
 * This file contains tests for the utility functions in the application.
 * Run with: npx ts-node src/tests/utils.test.ts
 */

// Helper function to run tests
function runTest(name: string, testFn: () => boolean | Promise<boolean>) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    const result = testFn();
    if (result instanceof Promise) {
      return result.then(success => {
        console.log(`${success ? '✅ PASSED' : '❌ FAILED'}: ${name}`);
        return success;
      }).catch(error => {
        console.error(`❌ ERROR: ${name}`, error);
        return false;
      });
    } else {
      console.log(`${result ? '✅ PASSED' : '❌ FAILED'}: ${name}`);
      return Promise.resolve(result);
    }
  } catch (error) {
    console.error(`❌ ERROR: ${name}`, error);
    return Promise.resolve(false);
  }
}

// Timestamp Utilities Tests
async function testTimestampUtils() {
  console.log('\n=== Timestamp Utilities Tests ===');
  
  let allPassed = true;
  
  // Test toISOString
  allPassed = await runTest('toISOString with Date object', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const result = toISOString(date);
    return result === '2023-01-01T12:00:00.000Z';
  }) && allPassed;
  
  allPassed = await runTest('toISOString with ISO string', () => {
    const result = toISOString('2023-01-01T12:00:00Z');
    return result === '2023-01-01T12:00:00.000Z';
  }) && allPassed;
  
  allPassed = await runTest('toISOString with seconds/nanoseconds object', () => {
    // This timestamp represents 2023-01-01T12:00:00Z
    const timestamp = { seconds: 1672574400, nanoseconds: 0 };
    const result = toISOString(timestamp);
    return result?.startsWith('2023-01-01');
  }) && allPassed;
  
  // Test toDate
  allPassed = await runTest('toDate with ISO string', () => {
    const result = toDate('2023-01-01T12:00:00Z');
    return result instanceof Date && result.getUTCFullYear() === 2023;
  }) && allPassed;
  
  allPassed = await runTest('toDate with seconds/nanoseconds object', () => {
    const timestamp = { seconds: 1672574400, nanoseconds: 0 };
    const result = toDate(timestamp);
    return result instanceof Date && result.getUTCFullYear() === 2023;
  }) && allPassed;
  
  // Test formatTimestamp
  allPassed = await runTest('formatTimestamp with different formats', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const shortFormat = formatTimestamp(date, 'short');
    const mediumFormat = formatTimestamp(date, 'medium');
    const longFormat = formatTimestamp(date, 'long');
    
    return shortFormat.length < mediumFormat.length && 
           mediumFormat.length < longFormat.length;
  }) && allPassed;
  
  // Test isValidTimestamp
  allPassed = await runTest('isValidTimestamp with valid inputs', () => {
    return isValidTimestamp(new Date()) && 
           isValidTimestamp('2023-01-01T12:00:00Z') &&
           isValidTimestamp({ seconds: 1672574400, nanoseconds: 0 });
  }) && allPassed;
  
  allPassed = await runTest('isValidTimestamp with invalid inputs', () => {
    return !isValidTimestamp('not a date') && 
           !isValidTimestamp({}) &&
           !isValidTimestamp(null);
  }) && allPassed;
  
  // Test getCurrentTimestamp and getCurrentISOString
  allPassed = await runTest('getCurrentTimestamp returns a valid timestamp', () => {
    const timestamp = getCurrentTimestamp();
    return timestamp && 'seconds' in timestamp && 'nanoseconds' in timestamp;
  }) && allPassed;
  
  allPassed = await runTest('getCurrentISOString returns a valid ISO string', () => {
    const isoString = getCurrentISOString();
    return typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(isoString);
  }) && allPassed;
  
  return allPassed;
}

// Error Utilities Tests
async function testErrorUtils() {
  console.log('\n=== Error Utilities Tests ===');
  
  let allPassed = true;
  
  // Test handleError with different error types
  allPassed = await runTest('handleError with different error types', () => {
    const validationError = handleError(new Error('Invalid input'), ErrorType.VALIDATION);
    const authError = handleError(new Error('Unauthorized'), ErrorType.AUTHENTICATION);
    const networkError = handleError(new Error('Network failure'), ErrorType.NETWORK);
    
    return validationError.includes('validation') && 
           authError.includes('authentication') && 
           networkError.includes('network');
  }) && allPassed;
  
  // Test createErrorHandler
  allPassed = await runTest('createErrorHandler with custom options', () => {
    const handleAuthError = createErrorHandler(ErrorType.AUTHENTICATION, {
      context: 'Auth Module'
    });
    
    const errorMessage = handleAuthError(new Error('Login failed'));
    return errorMessage.includes('authentication') && errorMessage.includes('login');
  }) && allPassed;
  
  return allPassed;
}

// HTML Utilities Tests
async function testHtmlUtils() {
  console.log('\n=== HTML Utilities Tests ===');
  
  let allPassed = true;
  
  // Test sanitizeHtml
  allPassed = await runTest('sanitizeHtml removes dangerous scripts', () => {
    const dangerousHtml = '<p>Safe text</p><script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(dangerousHtml);
    
    return sanitized.includes('<p>Safe text</p>') && 
           !sanitized.includes('<script>') &&
           !sanitized.includes('alert("XSS")');
  }) && allPassed;
  
  // Test createSafeHtml
  allPassed = await runTest('createSafeHtml creates React props object', () => {
    const html = '<p>Safe text</p>';
    const props = createSafeHtml(html);
    
    return props.dangerouslySetInnerHTML && 
           props.dangerouslySetInnerHTML.__html === html;
  }) && allPassed;
  
  // Test stripHtml
  allPassed = await runTest('stripHtml removes all HTML tags', () => {
    const html = '<h1>Title</h1><p>This is <strong>bold</strong> text.</p>';
    const text = stripHtml(html);
    
    return text === 'TitleThis is bold text.';
  }) && allPassed;
  
  // Test truncateHtml
  allPassed = await runTest('truncateHtml preserves HTML structure', () => {
    const html = '<p>This is a <strong>long</strong> paragraph that needs to be truncated.</p>';
    const truncated = truncateHtml(html, 20);
    
    return truncated.includes('<p>') && 
           truncated.includes('</p>') &&
           truncated.includes('<strong>') && 
           truncated.includes('</strong>') &&
           truncated.length < html.length;
  }) && allPassed;
  
  return allPassed;
}

// Environment Utilities Tests
async function testEnvUtils() {
  console.log('\n=== Environment Utilities Tests ===');
  
  let allPassed = true;
  
  // Mock import.meta.env for testing
  (global as any).import = {
    meta: {
      env: {
        VITE_TEST_STRING: 'test-value',
        VITE_TEST_BOOLEAN: 'true',
        VITE_TEST_NUMBER: '42',
        VITE_TEST_JSON: '{"name":"test","value":123}'
      }
    }
  };
  
  // Test getEnvVar
  allPassed = await runTest('getEnvVar retrieves environment variables', () => {
    const value = getEnvVar('VITE_TEST_STRING');
    const defaultValue = getEnvVar('VITE_NON_EXISTENT', { default: 'default-value' });
    
    return value === 'test-value' && defaultValue === 'default-value';
  }) && allPassed;
  
  // Test getBooleanEnvVar
  allPassed = await runTest('getBooleanEnvVar converts to boolean', () => {
    const value = getBooleanEnvVar('VITE_TEST_BOOLEAN');
    const defaultValue = getBooleanEnvVar('VITE_NON_EXISTENT', { default: 'false' });
    
    return value === true && defaultValue === false;
  }) && allPassed;
  
  // Test getNumberEnvVar
  allPassed = await runTest('getNumberEnvVar converts to number', () => {
    const value = getNumberEnvVar('VITE_TEST_NUMBER');
    const defaultValue = getNumberEnvVar('VITE_NON_EXISTENT', { default: '100' });
    
    return value === 42 && defaultValue === 100;
  }) && allPassed;
  
  // Test getJsonEnvVar
  allPassed = await runTest('getJsonEnvVar parses JSON', () => {
    const value = getJsonEnvVar<{ name: string, value: number }>('VITE_TEST_JSON');
    
    return value.name === 'test' && value.value === 123;
  }) && allPassed;
  
  return allPassed;
}

// Run all tests
async function runAllTests() {
  console.log('=== UTILITY FUNCTIONS TESTS ===');
  
  const timestampResults = await testTimestampUtils();
  const errorResults = await testErrorUtils();
  const htmlResults = await testHtmlUtils();
  const envResults = await testEnvUtils();
  
  const allPassed = timestampResults && errorResults && htmlResults && envResults;
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Timestamp Utilities: ${timestampResults ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Error Utilities: ${errorResults ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`HTML Utilities: ${htmlResults ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Environment Utilities: ${envResults ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Execute tests
runAllTests(); 