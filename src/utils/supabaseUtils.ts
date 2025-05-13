/**
 * Supabase Data Access Utilities
 * 
 * This file provides utility functions for interacting with Supabase,
 * replacing the previous Firebase Firestore utilities.
 */

import { supabase } from '../lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Response interface for Supabase operations
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Query options for fetching data
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
    value: any;
  }>;
}

/**
 * Apply filters to a Supabase query
 * @param query - The Supabase query builder
 * @param filters - Array of filter conditions
 * @returns The query with filters applied
 */
function applyFilters<T>(
  query: PostgrestFilterBuilder<any, any, T[]>,
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
    value: any;
  }>
): PostgrestFilterBuilder<any, any, T[]> {
  if (!filters || filters.length === 0) {
    return query;
  }

  let filteredQuery = query;

  filters.forEach(filter => {
    const { field, operator, value } = filter;
    
    switch (operator) {
      case 'eq':
        filteredQuery = filteredQuery.eq(field, value);
        break;
      case 'neq':
        filteredQuery = filteredQuery.neq(field, value);
        break;
      case 'gt':
        filteredQuery = filteredQuery.gt(field, value);
        break;
      case 'gte':
        filteredQuery = filteredQuery.gte(field, value);
        break;
      case 'lt':
        filteredQuery = filteredQuery.lt(field, value);
        break;
      case 'lte':
        filteredQuery = filteredQuery.lte(field, value);
        break;
      case 'like':
        filteredQuery = filteredQuery.like(field, value);
        break;
      case 'ilike':
        filteredQuery = filteredQuery.ilike(field, value);
        break;
      case 'in':
        filteredQuery = filteredQuery.in(field, value);
        break;
      case 'is':
        filteredQuery = filteredQuery.is(field, value);
        break;
      default:
        console.warn(`Unsupported filter operator: ${operator}`);
    }
  });

  return filteredQuery;
}

/**
 * Get a single item by ID
 * @param table - The table name
 * @param id - The item ID
 * @returns Promise with the item or error
 */
export async function getById<T>(
  table: string,
  id: string
): Promise<SupabaseResponse<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data as T,
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error getting ${table} by ID:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to get ${table} by ID`
    };
  }
}

/**
 * Get all items from a table with optional filtering
 * @param table - The table name
 * @param options - Query options (limit, offset, orderBy, filters)
 * @returns Promise with the items or error
 */
export async function getAll<T>(
  table: string,
  options?: QueryOptions
): Promise<SupabaseResponse<T[]>> {
  try {
    let query = supabase.from(table).select('*');

    // Apply filters if provided
    if (options?.filters && options.filters.length > 0) {
      query = applyFilters(query, options.filters);
    }

    // Apply ordering if provided
    if (options?.orderBy) {
      const direction = options.orderDirection || 'asc';
      query = query.order(options.orderBy, { ascending: direction === 'asc' });
    }

    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as T[],
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error getting all ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to get all ${table}`
    };
  }
}

/**
 * Insert a new item
 * @param table - The table name
 * @param data - The data to insert
 * @returns Promise with the inserted item or error
 */
export async function insert<T>(
  table: string,
  data: Partial<T>
): Promise<SupabaseResponse<T>> {
  try {
    // Add timestamps
    const dataWithTimestamps = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(dataWithTimestamps)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: insertedData as T,
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error inserting into ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to insert into ${table}`
    };
  }
}

/**
 * Update an existing item
 * @param table - The table name
 * @param id - The item ID
 * @param data - The data to update
 * @returns Promise with the updated item or error
 */
export async function update<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<SupabaseResponse<T>> {
  try {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updatedData, error } = await supabase
      .from(table)
      .update(dataWithTimestamp)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: updatedData as T,
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error updating ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to update ${table}`
    };
  }
}

/**
 * Delete an item
 * @param table - The table name
 * @param id - The item ID
 * @returns Promise with success status or error
 */
export async function remove(
  table: string,
  id: string
): Promise<SupabaseResponse<null>> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return {
      data: null,
      error: null,
      status: 'success',
      message: `Successfully deleted item from ${table}`
    };
  } catch (error: any) {
    console.error(`Error deleting from ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to delete from ${table}`
    };
  }
}

/**
 * Execute a custom query with joins
 * @param table - The primary table name
 * @param columns - The columns to select
 * @param options - Query options (limit, offset, orderBy, filters)
 * @returns Promise with the query results or error
 */
export async function query<T>(
  table: string,
  columns: string,
  options?: QueryOptions
): Promise<SupabaseResponse<T[]>> {
  try {
    let query = supabase.from(table).select(columns);

    // Apply filters if provided
    if (options?.filters && options.filters.length > 0) {
      query = applyFilters(query, options.filters);
    }

    // Apply ordering if provided
    if (options?.orderBy) {
      const direction = options.orderDirection || 'asc';
      query = query.order(options.orderBy, { ascending: direction === 'asc' });
    }

    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as T[],
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error querying ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to query ${table}`
    };
  }
}

/**
 * Count items in a table with optional filtering
 * @param table - The table name
 * @param filters - Optional filters to apply
 * @returns Promise with the count or error
 */
export async function count(
  table: string,
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
    value: any;
  }>
): Promise<SupabaseResponse<number>> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    // Apply filters if provided
    if (filters && filters.length > 0) {
      query = applyFilters(query, filters);
    }

    const { count: rowCount, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: rowCount || 0,
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error counting ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to count ${table}`
    };
  }
}

/**
 * Batch insert multiple items
 * @param table - The table name
 * @param items - Array of items to insert
 * @returns Promise with the inserted items or error
 */
export async function batchInsert<T>(
  table: string,
  items: Partial<T>[]
): Promise<SupabaseResponse<T[]>> {
  try {
    // Add timestamps to all items
    const itemsWithTimestamps = items.map(item => ({
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from(table)
      .insert(itemsWithTimestamps)
      .select();

    if (error) {
      throw error;
    }

    return {
      data: data as T[],
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error batch inserting into ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to batch insert into ${table}`
    };
  }
}

/**
 * Upsert items (insert if not exists, update if exists)
 * @param table - The table name
 * @param items - Array of items to upsert
 * @param onConflict - Column to check for conflicts
 * @returns Promise with the upserted items or error
 */
export async function upsert<T>(
  table: string,
  items: Partial<T>[],
  onConflict: string
): Promise<SupabaseResponse<T[]>> {
  try {
    // Add timestamps to all items
    const itemsWithTimestamps = items.map(item => ({
      ...item,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from(table)
      .upsert(itemsWithTimestamps, { onConflict })
      .select();

    if (error) {
      throw error;
    }

    return {
      data: data as T[],
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error(`Error upserting into ${table}:`, error);
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || `Failed to upsert into ${table}`
    };
  }
}

export default {
  getById,
  getAll,
  insert,
  update,
  remove,
  query,
  count,
  batchInsert,
  upsert
};
