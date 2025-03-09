# HopeCare Utility Documentation

This document provides detailed information about the utility modules available in the HopeCare application.

## Table of Contents

1. [Timestamp Utilities](#timestamp-utilities)
2. [Error Utilities](#error-utilities)
3. [Hook Utilities](#hook-utilities)
4. [HTML Utilities](#html-utilities)
5. [Environment Utilities](#environment-utilities)
6. [Storage Utilities](#storage-utilities)

## Timestamp Utilities

Located at: `src/utils/timestampUtils.ts`

These utilities provide consistent handling of timestamps across the application, supporting various formats including Firestore Timestamps, Date objects, ISO strings, and more.

### Functions

#### `toISOString(val: any): string | null`

Converts various timestamp formats to ISO string format.

```typescript
import { toISOString } from '../utils/timestampUtils';

// From Firestore Timestamp
const isoString = toISOString(firestoreTimestamp);

// From Date object
const isoString = toISOString(new Date());

// From seconds/nanoseconds object
const isoString = toISOString({ seconds: 1620000000, nanoseconds: 0 });
```

#### `toDate(val: any): Date | null`

Converts various timestamp formats to a JavaScript Date object.

```typescript
import { toDate } from '../utils/timestampUtils';

// From Firestore Timestamp
const date = toDate(firestoreTimestamp);

// From ISO string
const date = toDate('2023-05-03T12:00:00Z');
```

#### `formatTimestamp(val: any, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string`

Formats a timestamp into a human-readable string with different format options.

```typescript
import { formatTimestamp } from '../utils/timestampUtils';

// Format with default (medium) format
const formattedDate = formatTimestamp(timestamp);

// Format with specific format
const shortDate = formatTimestamp(timestamp, 'short');
const longDate = formatTimestamp(timestamp, 'long');
```

#### `isValidTimestamp(val: any): boolean`

Checks if a value is a valid timestamp.

```typescript
import { isValidTimestamp } from '../utils/timestampUtils';

if (isValidTimestamp(value)) {
  // Process the timestamp
}
```

#### `getCurrentTimestamp(): Timestamp`

Gets the current time as a Firestore Timestamp.

```typescript
import { getCurrentTimestamp } from '../utils/timestampUtils';

const now = getCurrentTimestamp();
```

#### `getCurrentISOString(): string`

Gets the current time as an ISO string.

```typescript
import { getCurrentISOString } from '../utils/timestampUtils';

const nowIso = getCurrentISOString();
```

## Error Utilities

Located at: `src/utils/errorUtils.ts`

These utilities provide consistent error handling across the application, with support for different error types, user-friendly messages, and logging.

### Types and Interfaces

#### `ErrorType`

Enum defining different categories of errors.

```typescript
enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  DATABASE = 'database',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}
```

#### `ErrorHandlerOptions`

Interface defining options for error handling.

```typescript
interface ErrorHandlerOptions {
  showToast?: boolean;      // Whether to show a toast notification
  logToServer?: boolean;    // Whether to log the error to the server
  throwError?: boolean;     // Whether to rethrow the error
  context?: string;         // Additional context about where the error occurred
  userMessage?: string;     // Custom message to show to the user
}
```

### Functions

#### `handleError(error: any, type: ErrorType = ErrorType.UNKNOWN, options: ErrorHandlerOptions = {}): string`

Handles an error with the specified type and options.

```typescript
import { handleError, ErrorType } from '../utils/errorUtils';

try {
  // Some operation that might fail
} catch (error) {
  const userMessage = handleError(error, ErrorType.DATABASE, {
    showToast: true,
    context: 'UserProfile.updateUserData'
  });
  // userMessage can be displayed to the user
}
```

#### `createErrorHandler(defaultType: ErrorType = ErrorType.UNKNOWN, defaultOptions: ErrorHandlerOptions = {})`

Creates a specialized error handler with default type and options.

```typescript
import { createErrorHandler, ErrorType } from '../utils/errorUtils';

// Create a specialized error handler for authentication errors
const handleAuthError = createErrorHandler(ErrorType.AUTHENTICATION, {
  showToast: true,
  logToServer: true
});

try {
  // Authentication operation
} catch (error) {
  handleAuthError(error, { context: 'Login.submitForm' });
}
```

## Hook Utilities

Located at: `src/utils/hookUtils.ts`

These utilities provide custom React hooks for common patterns and functionality.

### Hooks

#### `useIsMounted(): () => boolean`

Returns a function that indicates whether the component is still mounted.

```typescript
import { useIsMounted } from '../utils/hookUtils';

function MyComponent() {
  const isMounted = useIsMounted();
  
  useEffect(() => {
    fetchData().then(data => {
      // Only update state if component is still mounted
      if (isMounted()) {
        setData(data);
      }
    });
  }, []);
}
```

#### `useSafeState<T>(initialState: T): [T, (value: T | ((prevState: T) => T)) => void]`

Like useState, but prevents updates after the component has unmounted.

```typescript
import { useSafeState } from '../utils/hookUtils';

function MyComponent() {
  const [data, setData] = useSafeState(null);
  
  useEffect(() => {
    fetchData().then(result => {
      // Safe to call even if component unmounts during fetch
      setData(result);
    });
  }, []);
}
```

#### `useSafeAsync<T>(fn: T, deps: React.DependencyList = []): T`

Wraps an async function to make it safe for use in components that might unmount.

```typescript
import { useSafeAsync } from '../utils/hookUtils';

function MyComponent() {
  const [data, setData] = useState(null);
  
  const fetchDataSafely = useSafeAsync(async () => {
    const result = await api.fetchData();
    setData(result); // Won't be called if component unmounts
    return result;
  }, []);
  
  useEffect(() => {
    fetchDataSafely();
  }, [fetchDataSafely]);
}
```

#### `useInterval(callback: () => void, delay: number | null)`

Sets up an interval that is properly cleaned up when the component unmounts.

```typescript
import { useInterval } from '../utils/hookUtils';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  // Increment count every second
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);
}
```

#### `useTimeout(callback: () => void, delay: number | null)`

Sets up a timeout that is properly cleaned up when the component unmounts.

```typescript
import { useTimeout } from '../utils/hookUtils';

function MyComponent() {
  const [isVisible, setIsVisible] = useState(true);
  
  // Hide component after 5 seconds
  useTimeout(() => {
    setIsVisible(false);
  }, 5000);
}
```

#### `useEventListener(eventName: string, handler: (event: any) => void, element: any = window)`

Adds an event listener that is properly cleaned up when the component unmounts.

```typescript
import { useEventListener } from '../utils/hookUtils';

function MyComponent() {
  const handleResize = () => {
    // Handle window resize
  };
  
  // Listen for window resize events
  useEventListener('resize', handleResize);
  
  // Listen for click events on a specific element
  const buttonRef = useRef(null);
  useEventListener('click', handleClick, buttonRef.current);
}
```

## HTML Utilities

Located at: `src/utils/htmlUtils.ts`

These utilities provide safe handling of HTML content, including sanitization, rendering, and manipulation.

### Functions

#### `sanitizeHtml(html: string, config = {}): string`

Sanitizes HTML content to prevent XSS attacks.

```typescript
import { sanitizeHtml } from '../utils/htmlUtils';

// Basic sanitization
const safeHtml = sanitizeHtml(userProvidedHtml);

// Sanitization with custom configuration
const safeHtml = sanitizeHtml(userProvidedHtml, {
  allowedTags: ['p', 'b', 'i', 'a'],
  allowedAttributes: {
    'a': ['href', 'target']
  }
});
```

#### `createSafeHtml(html: string, config = {}): { dangerouslySetInnerHTML: { __html: string } }`

Creates a safe object for use with React's dangerouslySetInnerHTML.

```typescript
import { createSafeHtml } from '../utils/htmlUtils';

function MyComponent({ htmlContent }) {
  return <div {...createSafeHtml(htmlContent)} />;
}
```

#### `stripHtml(html: string): string`

Removes all HTML tags from a string, returning only the text content.

```typescript
import { stripHtml } from '../utils/htmlUtils';

const textOnly = stripHtml('<p>This is <b>bold</b> text</p>');
// Result: "This is bold text"
```

#### `truncateHtml(html: string, maxLength: number, suffix = '...'): string`

Truncates HTML content to a specified maximum length while preserving valid HTML structure.

```typescript
import { truncateHtml } from '../utils/htmlUtils';

const truncated = truncateHtml(longHtmlContent, 100);
// Result: HTML content truncated to ~100 characters with "..." appended
```

## Environment Utilities

Located at: `src/utils/envUtils.ts`

These utilities provide safe access to environment variables with validation and default values.

### Types and Interfaces

#### `EnvVarConfig`

Interface defining configuration options for environment variable access.

```typescript
interface EnvVarConfig {
  required?: boolean;       // Whether the variable is required
  default?: string;         // Default value if not provided
  validator?: (value: string) => boolean;  // Validation function
}
```

### Functions

#### `getEnvVar(name: string, config: EnvVarConfig = {}): string`

Gets an environment variable with validation and default value.

```typescript
import { getEnvVar } from '../utils/envUtils';

// Get a required environment variable
const apiKey = getEnvVar('VITE_API_KEY', { required: true });

// Get an environment variable with a default value
const apiUrl = getEnvVar('VITE_API_URL', { 
  default: 'https://api.example.com' 
});

// Get an environment variable with validation
const maxRetries = getEnvVar('VITE_MAX_RETRIES', {
  default: '3',
  validator: value => !isNaN(Number(value)) && Number(value) > 0
});
```

#### `getBooleanEnvVar(name: string, config: EnvVarConfig = {}): boolean`

Gets an environment variable as a boolean value.

```typescript
import { getBooleanEnvVar } from '../utils/envUtils';

// Get a boolean environment variable
const isProduction = getBooleanEnvVar('VITE_IS_PRODUCTION', { 
  default: 'false' 
});
```

#### `getNumberEnvVar(name: string, config: EnvVarConfig = {}): number`

Gets an environment variable as a number value.

```typescript
import { getNumberEnvVar } from '../utils/envUtils';

// Get a number environment variable
const timeout = getNumberEnvVar('VITE_TIMEOUT_MS', { 
  default: '5000' 
});
```

#### `getJsonEnvVar<T>(name: string, config: EnvVarConfig = {}): T`

Gets an environment variable as a parsed JSON value.

```typescript
import { getJsonEnvVar } from '../utils/envUtils';

// Get a JSON environment variable
const config = getJsonEnvVar('VITE_APP_CONFIG', { 
  default: '{"theme":"light","language":"en"}' 
});
```

## Storage Utilities

Located at: `src/utils/storageUtils.ts`

These utilities provide a consistent interface for file storage operations, supporting both Firebase Storage and Supabase Storage.

### Functions

#### `uploadFile(path: string, file: File, metadata?: any): Promise<StorageResponse>`

Uploads a file to the configured storage provider.

```typescript
import { uploadFile } from '../utils/storageUtils';

async function handleFileUpload(file) {
  const result = await uploadFile('images/profile.jpg', file, {
    contentType: file.type
  });
  
  if (result.error) {
    console.error('Upload failed:', result.error);
  } else {
    console.log('File uploaded, URL:', result.url);
  }
}
```

#### `uploadBuffer(path: string, buffer: Buffer | ArrayBuffer, metadata?: any): Promise<StorageResponse>`

Uploads a buffer to the configured storage provider.

```typescript
import { uploadBuffer } from '../utils/storageUtils';

async function handleBufferUpload(buffer) {
  const result = await uploadBuffer('documents/report.pdf', buffer, {
    contentType: 'application/pdf'
  });
  
  if (result.error) {
    console.error('Upload failed:', result.error);
  } else {
    console.log('Buffer uploaded, URL:', result.url);
  }
}
```

#### `uploadDataUrl(path: string, dataUrl: string, metadata?: any): Promise<StorageResponse>`

Uploads a data URL to the configured storage provider.

```typescript
import { uploadDataUrl } from '../utils/storageUtils';

async function handleCanvasUpload(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const result = await uploadDataUrl('images/canvas.png', dataUrl);
  
  if (result.error) {
    console.error('Upload failed:', result.error);
  } else {
    console.log('Canvas uploaded, URL:', result.url);
  }
}
```

#### `getFileUrl(path: string): Promise<StorageResponse>`

Gets the URL for a file from the configured storage provider.

```typescript
import { getFileUrl } from '../utils/storageUtils';

async function displayImage(imagePath) {
  const result = await getFileUrl(imagePath);
  
  if (result.error) {
    console.error('Failed to get URL:', result.error);
  } else {
    setImageUrl(result.url);
  }
}
```

#### `getSignedUrl(path: string, expiresIn?: number): Promise<StorageResponse>`

Gets a signed URL for a file from the configured storage provider.

```typescript
import { getSignedUrl } from '../utils/storageUtils';

async function getTemporaryAccess(filePath) {
  // Get a URL that expires in 1 hour (3600 seconds)
  const result = await getSignedUrl(filePath, 3600);
  
  if (result.error) {
    console.error('Failed to get signed URL:', result.error);
  } else {
    window.open(result.url, '_blank');
  }
}
```

#### `deleteFile(path: string): Promise<StorageResponse>`

Deletes a file from the configured storage provider.

```typescript
import { deleteFile } from '../utils/storageUtils';

async function removeFile(filePath) {
  const result = await deleteFile(filePath);
  
  if (result.error) {
    console.error('Failed to delete file:', result.error);
  } else {
    console.log('File deleted successfully');
  }
}
```

#### `listFiles(path: string): Promise<StorageListResponse>`

Lists files in a directory from the configured storage provider.

```typescript
import { listFiles } from '../utils/storageUtils';

async function displayUserFiles(userId) {
  const result = await listFiles(`users/${userId}/files/`);
  
  if (result.error) {
    console.error('Failed to list files:', result.error);
  } else {
    setFiles(result.files);
  }
}
```

#### Path Generation Utilities

Several utilities for generating consistent file paths:

```typescript
import { 
  generateFilePath,
  generateUserFilePath,
  generateProjectFilePath,
  generateEventFilePath
} from '../utils/storageUtils';

// Generate a general file path
const path = generateFilePath('documents', 'report.pdf');

// Generate a user-specific file path
const userPath = generateUserFilePath('123', 'profile.jpg');

// Generate a project-specific file path
const projectPath = generateProjectFilePath('456', 'thumbnail.png');

// Generate an event-specific file path
const eventPath = generateEventFilePath('789', 'banner.jpg');
``` 