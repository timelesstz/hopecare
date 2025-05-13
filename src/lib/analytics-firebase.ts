/**
 * Firebase Analytics Compatibility Layer
 * 
 * This file re-exports the Supabase analytics implementation to maintain
 * backward compatibility with code that imports from analytics-firebase.ts
 */

// Re-export everything from the Supabase implementation
export * from './analytics-supabase';
