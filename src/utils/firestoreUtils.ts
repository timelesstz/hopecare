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
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, logFirestoreError } from './firestoreErrorHandler';

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
  error: string | null;
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
    logFirestoreError(error, `getAll:${collectionName}`);
    return { data: null, error: handleFirestoreError(error) };
  }
}

/**
 * Get a single document by ID
 * @param collectionName The collection to query
 * @param id The document ID
 * @returns The document data or error
 */
export async function getById<T>(collectionName: string, id: string): Promise<FirestoreResponse<T>> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        data: { id: docSnap.id, ...docSnap.data() } as T, 
        error: null 
      };
    } else {
      return { 
        data: null, 
        error: `Document not found in ${collectionName} with ID: ${id}` 
      };
    }
  } catch (error) {
    logFirestoreError(error, `getById:${collectionName}`);
    return { 
      data: null, 
      error: handleFirestoreError(error) 
    };
  }
}

/**
 * Query a collection with filters
 * @param collectionName The collection to query
 * @param options Query options (select, where, orderBy, limit)
 * @returns Array of documents or error
 */
export async function query<T>(collectionName: string, options: QueryOptions = {}): Promise<FirestoreResponse<T[]>> {
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
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      // If select is specified, only include those fields
      if (options.select && options.select.length > 0) {
        const selectedData: Record<string, any> = { id: doc.id };
        options.select.forEach(field => {
          if (doc.data()[field] !== undefined) {
            selectedData[field] = doc.data()[field];
          }
        });
        results.push(selectedData as T);
      } else {
        results.push({ id: doc.id, ...doc.data() } as T);
      }
    });
    
    return { data: results, error: null };
  } catch (error) {
    logFirestoreError(error, `query:${collectionName}`);
    return { 
      data: null, 
      error: handleFirestoreError(error) 
    };
  }
}

/**
 * Insert a document into a collection
 * @param collectionName The collection to insert into
 * @param data The document data
 * @returns The inserted document with ID or error
 */
export async function insert<T extends DocumentData>(collectionName: string, data: T): Promise<FirestoreResponse<T>> {
  try {
    // Add timestamps
    const dataWithTimestamps = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamps);
    
    return { 
      data: { id: docRef.id, ...data } as T, 
      error: null 
    };
  } catch (error) {
    logFirestoreError(error, `insert:${collectionName}`);
    return { 
      data: null, 
      error: handleFirestoreError(error) 
    };
  }
}

/**
 * Update a document by ID
 * @param collectionName The collection containing the document
 * @param id The document ID
 * @param data The data to update
 * @returns The updated document or error
 */
export async function update<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<FirestoreResponse<T>> {
  try {
    const docRef = doc(db, collectionName, id);
    
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...data,
      updated_at: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    
    if (updatedDoc.exists()) {
      return { 
        data: { id: updatedDoc.id, ...updatedDoc.data() } as T, 
        error: null 
      };
    } else {
      return { 
        data: null, 
        error: `Failed to retrieve updated document in ${collectionName} with ID: ${id}` 
      };
    }
  } catch (error) {
    logFirestoreError(error, `update:${collectionName}`);
    return { 
      data: null, 
      error: handleFirestoreError(error) 
    };
  }
}

/**
 * Delete a document by ID
 * @param collectionName The collection containing the document
 * @param id The document ID
 * @returns Success status or error
 */
export async function remove(collectionName: string, id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    
    return { success: true, error: null };
  } catch (error) {
    logFirestoreError(error, `remove:${collectionName}`);
    return { 
      success: false, 
      error: handleFirestoreError(error) 
    };
  }
}

/**
 * Upsert a document (update if exists, insert if not)
 * @param collectionName The collection to upsert into
 * @param id The document ID
 * @param data The document data
 * @returns The upserted document or error
 */
export async function upsert<T extends DocumentData>(collectionName: string, id: string, data: T): Promise<FirestoreResponse<T>> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Document exists, update it
      const dataWithTimestamp = {
        ...data,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(docRef, dataWithTimestamp);
    } else {
      // Document doesn't exist, set it with ID
      const dataWithTimestamps = {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      await setDoc(docRef, dataWithTimestamps);
    }
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    
    if (updatedDoc.exists()) {
      return { 
        data: { id: updatedDoc.id, ...updatedDoc.data() } as T, 
        error: null 
      };
    } else {
      return { 
        data: null, 
        error: `Failed to retrieve upserted document in ${collectionName} with ID: ${id}` 
      };
    }
  } catch (error) {
    logFirestoreError(error, `upsert:${collectionName}`);
    return { 
      data: null, 
      error: handleFirestoreError(error) 
    };
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