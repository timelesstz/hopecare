import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Utility functions to help with Firestore queries
 * These functions provide a similar API to Supabase for easier migration
 */

interface QueryOptions {
  select?: string[];
  where?: [string, WhereFilterOp, any][];
  orderBy?: [string, 'asc' | 'desc'][];
  limit?: number;
}

interface FirestoreResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Handle Firestore errors with more specific error messages
 */
function handleFirestoreError(error: unknown, operation: string): Error {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        return new Error(`Access denied: You don't have permission to ${operation}`);
      case 'not-found':
        return new Error(`Document not found`);
      case 'already-exists':
        return new Error(`Document already exists`);
      case 'resource-exhausted':
        return new Error(`Quota exceeded. Please try again later`);
      case 'failed-precondition':
        return new Error(`Operation failed: The system is not in a state required for this operation`);
      case 'unavailable':
        return new Error(`Service unavailable. Please try again later`);
      default:
        return new Error(`${operation} failed: ${error.message}`);
    }
  }
  
  return error instanceof Error ? error : new Error(`Unknown error during ${operation}`);
}

/**
 * Get all documents from a collection with optional filtering
 */
export async function getAll<T = DocumentData>(
  collectionName: string, 
  options: QueryOptions = {}
): Promise<FirestoreResponse<T[]>> {
  try {
    const constraints: QueryConstraint[] = [];
    
    // Add where clauses
    if (options.where) {
      options.where.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    // Add orderBy clauses
    if (options.orderBy) {
      options.orderBy.forEach(([field, direction]) => {
        constraints.push(orderBy(field, direction));
      });
    }
    
    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      
      // If select is specified, only return those fields
      if (options.select && options.select.length > 0) {
        const selectedData: DocumentData = { id: doc.id };
        options.select.forEach(field => {
          if (field in docData) {
            selectedData[field] = docData[field];
          }
        });
        return selectedData as T;
      }
      
      return { id: doc.id, ...docData } as T;
    });
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleFirestoreError(error, 'query') };
  }
}

/**
 * Get a single document by ID
 */
export async function getById<T = DocumentData>(
  collectionName: string, 
  id: string
): Promise<FirestoreResponse<T>> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as T, error: null };
    } else {
      return { data: null, error: new Error('Document not found') };
    }
  } catch (error) {
    return { data: null, error: handleFirestoreError(error, 'get') };
  }
}

/**
 * Create a new document
 */
export async function create<T = DocumentData>(
  collectionName: string, 
  data: any
): Promise<FirestoreResponse<T>> {
  try {
    // Add timestamps
    const dataWithTimestamps = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    // If ID is provided, use it as the document ID
    if (data.id) {
      const docRef = doc(db, collectionName, data.id);
      await updateDoc(docRef, dataWithTimestamps);
      return { data: { id: data.id, ...dataWithTimestamps } as T, error: null };
    } else {
      const docRef = await addDoc(collection(db, collectionName), dataWithTimestamps);
      return { data: { id: docRef.id, ...dataWithTimestamps } as T, error: null };
    }
  } catch (error) {
    return { data: null, error: handleFirestoreError(error, 'create') };
  }
}

/**
 * Update an existing document
 */
export async function update<T = DocumentData>(
  collectionName: string, 
  id: string, 
  data: any
): Promise<FirestoreResponse<T>> {
  try {
    const docRef = doc(db, collectionName, id);
    
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...data,
      updated_at: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    return { data: { id, ...dataWithTimestamp } as T, error: null };
  } catch (error) {
    return { data: null, error: handleFirestoreError(error, 'update') };
  }
}

/**
 * Delete a document
 */
export async function remove(
  collectionName: string, 
  id: string
): Promise<FirestoreResponse<{ id: string }>> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error: handleFirestoreError(error, 'delete') };
  }
}

/**
 * Example usage:
 * 
 * // Supabase:
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('id, name, email')
 *   .eq('role', 'DONOR')
 *   .order('created_at', { ascending: false })
 *   .limit(10);
 * 
 * // Firestore equivalent:
 * const { data, error } = await getAll('users', {
 *   select: ['id', 'name', 'email'],
 *   where: [['role', '==', 'DONOR']],
 *   orderBy: [['created_at', 'desc']],
 *   limit: 10
 * });
 */ 