import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Utility functions for handling React hooks safely
 */

/**
 * A hook that returns a ref that tracks whether the component is mounted
 * @returns A ref object that is true when the component is mounted, false otherwise
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
};

/**
 * A hook that creates a safe setState function that only updates state if the component is mounted
 * @param initialState The initial state
 * @returns A tuple containing the state and a safe setState function
 */
export function useSafeState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const isMounted = useIsMounted();
  
  const setSafeState = useCallback((value: T | ((prevState: T) => T)) => {
    if (isMounted.current) {
      setState(value);
    }
  }, [isMounted]);
  
  return [state, setSafeState];
}

/**
 * A hook that creates a safe async function that only executes if the component is mounted
 * @param fn The async function to make safe
 * @param deps The dependencies array for the useCallback hook
 * @returns A safe async function that only executes if the component is mounted
 */
export function useSafeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  deps: React.DependencyList = []
): T {
  const isMounted = useIsMounted();
  
  return useCallback(async (...args: Parameters<T>) => {
    if (isMounted.current) {
      return await fn(...args);
    }
    return undefined;
  }, [isMounted, fn, ...deps]) as T;
}

/**
 * A hook that creates an interval that is automatically cleared when the component unmounts
 * @param callback The function to call on each interval
 * @param delay The delay in milliseconds
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    
    return undefined;
  }, [delay]);
}

/**
 * A hook that creates a timeout that is automatically cleared when the component unmounts
 * @param callback The function to call after the timeout
 * @param delay The delay in milliseconds
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the timeout
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    
    if (delay !== null) {
      const id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
    
    return undefined;
  }, [delay]);
}

/**
 * A hook that creates an event listener that is automatically removed when the component unmounts
 * @param eventName The name of the event to listen for
 * @param handler The event handler function
 * @param element The element to attach the event listener to (defaults to window)
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window = window
): void;
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: T | null
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document
): void;
export function useEventListener(
  eventName: string,
  handler: (event: any) => void,
  element: any = window
): void {
  // Create a ref that stores the handler
  const savedHandler = useRef<(event: any) => void>();
  
  // Update ref.current value if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // Make sure element supports addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    // Create event listener that calls handler function stored in ref
    const eventListener = (event: any) => savedHandler.current?.(event);
    
    // Add event listener
    element.addEventListener(eventName, eventListener);
    
    // Remove event listener on cleanup
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

export default {
  useIsMounted,
  useSafeState,
  useSafeAsync,
  useInterval,
  useTimeout,
  useEventListener
}; 