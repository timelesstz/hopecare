import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMounted } from '../utils/hookUtils';
import { handleError, ErrorType } from '../utils/errorUtils';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface FetchOptions {
  /**
   * Cache expiration time in milliseconds
   * Default: 5 minutes
   */
  cacheTime?: number;
  
  /**
   * Whether to skip the fetch
   * Useful for conditional fetching
   */
  skip?: boolean;
  
  /**
   * Whether to refetch on mount even if cached
   */
  refetchOnMount?: boolean;
  
  /**
   * Headers to include in the fetch request
   */
  headers?: HeadersInit;
  
  /**
   * Request method (GET, POST, etc.)
   */
  method?: string;
  
  /**
   * Request body (for POST, PUT, etc.)
   */
  body?: any;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Global cache shared between hook instances
const globalCache: Record<string, CacheItem<any>> = {};

/**
 * Custom hook for data fetching with caching
 * 
 * Features:
 * - Caching with configurable expiration
 * - Safe state updates (prevents updates after unmount)
 * - Automatic error handling
 * - Refetching capability
 * - Skip option for conditional fetching
 * 
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns Fetch state: { data, loading, error, refetch }
 */
function useCachedFetch<T = any>(url: string, options: FetchOptions = {}): FetchState<T> {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    skip = false,
    refetchOnMount = false,
    headers,
    method = 'GET',
    body
  } = options;
  
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !skip,
    error: null,
    refetch: async () => {}
  });
  
  const isMounted = useIsMounted();
  const cacheKey = `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
  
  // Function to fetch data
  const fetchData = useCallback(async (ignoreCache = false) => {
    // Skip if requested
    if (skip) return;
    
    // Check cache first (unless ignoreCache is true)
    if (!ignoreCache && globalCache[cacheKey]) {
      const cachedItem = globalCache[cacheKey];
      const now = Date.now();
      
      // Use cached data if not expired
      if (now - cachedItem.timestamp < cacheTime) {
        if (isMounted()) {
          setState(prev => ({ ...prev, data: cachedItem.data, loading: false }));
        }
        return;
      }
    }
    
    // Set loading state
    if (isMounted()) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'same-origin'
      };
      
      // Add body if provided
      if (body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      // Fetch data
      const response = await fetch(url, fetchOptions);
      
      // Handle non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Update cache
      globalCache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      // Update state if component is still mounted
      if (isMounted()) {
        setState(prev => ({ ...prev, data, loading: false, error: null }));
      }
    } catch (error) {
      // Handle error
      const errorMessage = handleError(error, ErrorType.NETWORK, {
        context: `useCachedFetch(${url})`,
        showToast: false
      });
      
      // Update state if component is still mounted
      if (isMounted()) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error : new Error(errorMessage)
        }));
      }
    }
  }, [url, method, body, headers, cacheKey, cacheTime, skip, isMounted]);
  
  // Function to refetch data
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);
  
  // Update refetch function in state
  useEffect(() => {
    setState(prev => ({ ...prev, refetch }));
  }, [refetch]);
  
  // Fetch data on mount or when dependencies change
  useEffect(() => {
    // Determine if we should use cache or refetch
    const shouldRefetch = refetchOnMount || !globalCache[cacheKey];
    fetchData(!shouldRefetch);
  }, [fetchData, cacheKey, refetchOnMount]);
  
  return state;
}

export default useCachedFetch; 