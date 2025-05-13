// Firebase to Supabase Migration Compatibility Layer
// This file provides compatibility between Firebase and Supabase during migration
import { supabase } from '../lib/supabase';

// Define types to match Firebase interfaces for compatibility
type FirebaseApp = any;
type Auth = any;
type Firestore = any;
type FirebaseStorage = any;
interface Analytics {
  getAnalytics: () => any;
  logEvent: (analyticsInstance: any, eventName: string, eventParams?: any) => void;
}

console.log('Using Supabase compatibility layer for Firebase');

// Create dummy implementations that use Supabase where possible
let app: FirebaseApp = {};
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
// Create a dummy analytics object with required methods
const analyticsImplementation = {
  getAnalytics: () => ({}),
  logEvent: (_: any, eventName: string, eventParams?: any) => {
    console.log('Analytics event tracked via Supabase:', eventName, eventParams);
  },
  setUserId: (_: any, userId: string) => {
    console.log('Set user ID:', userId);
  },
  setUserProperties: (_: any, properties: any) => {
    console.log('Set user properties:', properties);
  }
};

// Define analytics variable that will be exported
let analytics: Analytics = analyticsImplementation;

// Create Supabase compatibility layer for Firebase Auth
auth = {
  currentUser: null,
  // Map Firebase auth state changes to Supabase auth state changes
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Initial check
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const mappedUser = {
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name,
          ...data.user
        };
        callback(mappedUser);
      } else {
        callback(null);
      }
    });

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mappedUser = {
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name,
          ...session.user
        };
        callback(mappedUser);
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => { data.subscription.unsubscribe(); };
  },
  
  // Map Firebase sign in to Supabase sign in
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  },
  
  // Map Firebase create user to Supabase sign up
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { user: data.user };
  },
  
  // Map Firebase sign out to Supabase sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }
};

// Initialize Firebase Analytics
export const initializeAnalytics = () => {
  try {
    return analytics;
  } catch (error) {
    console.error('Error initializing analytics:', error);
    return null;
  }
};

// Create Supabase compatibility layer for Firestore
db = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      get: async () => {
        // Use type assertion to handle dynamic table names
        const { data, error } = await supabase
          .from(collectionName as any)
          .select('*')
          .eq('id', docId)
          .single();
          
        if (error) throw error;
        
        return {
          exists: !!data,
          data: () => data,
          id: docId
        };
      },
      set: async (docData: any) => {
        // Use type assertion to handle dynamic table names
        const { error } = await supabase
          .from(collectionName as any)
          .upsert({ id: docId, ...docData });
          
        if (error) throw error;
        return true;
      },
      update: async (docData: any) => {
        // Use type assertion to handle dynamic table names
        const { error } = await supabase
          .from(collectionName as any)
          .update(docData)
          .eq('id', docId);
          
        if (error) throw error;
        return true;
      },
      delete: async () => {
        // Use type assertion to handle dynamic table names
        const { error } = await supabase
          .from(collectionName as any)
          .delete()
          .eq('id', docId);
          
        if (error) throw error;
        return true;
      }
    })
  })
};

// Create Supabase compatibility layer for Storage
storage = {
  ref: (path: string) => ({
    put: async (file: File) => {
      const { error } = await supabase.storage
        .from('default')
        .upload(path, file);
        
      if (error) throw error;
      return { ref: { fullPath: path } };
    },
    getDownloadURL: async () => {
      const { data } = supabase.storage
        .from('default')
        .getPublicUrl(path);
        
      return data.publicUrl;
    }
  })
};

// Analytics is already defined above, no need to redefine it here

export { app, auth, db, storage, analytics };