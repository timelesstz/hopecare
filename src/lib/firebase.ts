// Re-export Firebase services from the new implementation
import { app, auth, db, storage, analytics } from '../firebase/config';

// Log that we're using the new implementation
console.log('Using Firebase services from the centralized config');

export { app, auth, db, storage, analytics }; 