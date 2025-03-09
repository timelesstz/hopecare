/**
 * Utility functions for safely accessing environment variables
 */

/**
 * Interface for environment variable configuration
 */
interface EnvVarConfig {
  required?: boolean;
  default?: string;
  validator?: (value: string) => boolean;
}

/**
 * Gets an environment variable with validation and fallback
 * @param name The name of the environment variable
 * @param config Configuration for the environment variable
 * @returns The environment variable value or fallback
 * @throws Error if the environment variable is required but not found or invalid
 */
export const getEnvVar = (name: string, config: EnvVarConfig = {}): string => {
  const value = import.meta.env[name] as string | undefined;
  
  // Check if the environment variable exists
  if (value === undefined) {
    // If required, throw an error
    if (config.required) {
      throw new Error(`Environment variable ${name} is required but not found`);
    }
    
    // Otherwise, return the default value
    return config.default || '';
  }
  
  // Validate the environment variable if a validator is provided
  if (config.validator && !config.validator(value)) {
    // If required, throw an error
    if (config.required) {
      throw new Error(`Environment variable ${name} is invalid`);
    }
    
    // Otherwise, return the default value
    return config.default || '';
  }
  
  // Return the environment variable value
  return value;
};

/**
 * Gets a boolean environment variable
 * @param name The name of the environment variable
 * @param config Configuration for the environment variable
 * @returns The environment variable value as a boolean
 */
export const getBooleanEnvVar = (name: string, config: EnvVarConfig = {}): boolean => {
  const value = getEnvVar(name, config);
  
  // Convert the value to a boolean
  return value.toLowerCase() === 'true';
};

/**
 * Gets a number environment variable
 * @param name The name of the environment variable
 * @param config Configuration for the environment variable
 * @returns The environment variable value as a number
 */
export const getNumberEnvVar = (name: string, config: EnvVarConfig = {}): number => {
  const value = getEnvVar(name, config);
  
  // Convert the value to a number
  const num = Number(value);
  
  // Check if the value is a valid number
  if (isNaN(num)) {
    // If required, throw an error
    if (config.required) {
      throw new Error(`Environment variable ${name} is not a valid number`);
    }
    
    // Otherwise, return the default value
    return config.default ? Number(config.default) : 0;
  }
  
  // Return the number
  return num;
};

/**
 * Gets a JSON environment variable
 * @param name The name of the environment variable
 * @param config Configuration for the environment variable
 * @returns The environment variable value parsed as JSON
 */
export const getJsonEnvVar = <T>(name: string, config: EnvVarConfig = {}): T => {
  const value = getEnvVar(name, config);
  
  try {
    // Parse the value as JSON
    return JSON.parse(value) as T;
  } catch (error) {
    // If required, throw an error
    if (config.required) {
      throw new Error(`Environment variable ${name} is not valid JSON`);
    }
    
    // Otherwise, return the default value
    return config.default ? JSON.parse(config.default) as T : {} as T;
  }
};

/**
 * Common environment variables used in the application
 */
export const env = {
  // Firebase Configuration
  FIREBASE_API_KEY: getEnvVar('VITE_FIREBASE_API_KEY', { required: true }),
  FIREBASE_AUTH_DOMAIN: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', { required: true }),
  FIREBASE_PROJECT_ID: getEnvVar('VITE_FIREBASE_PROJECT_ID', { required: true }),
  FIREBASE_STORAGE_BUCKET: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', { required: true }),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', { required: true }),
  FIREBASE_APP_ID: getEnvVar('VITE_FIREBASE_APP_ID', { required: true }),
  FIREBASE_MEASUREMENT_ID: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', { required: false }),
  
  // Supabase Configuration
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', { required: false }),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', { required: false }),
  USE_SUPABASE_STORAGE: getBooleanEnvVar('VITE_USE_SUPABASE_STORAGE', { default: 'false' }),
  
  // Application Configuration
  APP_NAME: getEnvVar('VITE_APP_NAME', { default: 'HopeCare' }),
  APP_URL: getEnvVar('VITE_APP_URL', { default: 'http://localhost:5173' }),
  APP_ENVIRONMENT: getEnvVar('VITE_APP_ENVIRONMENT', { default: 'development' }),
  
  // Payment Configuration
  FLUTTERWAVE_PUBLIC_KEY: getEnvVar('VITE_FLUTTERWAVE_PUBLIC_KEY', { required: false }),
  
  // Helper function to check if we're in development mode
  isDevelopment: (): boolean => {
    return getEnvVar('VITE_APP_ENVIRONMENT', { default: 'development' }) === 'development';
  },
  
  // Helper function to check if we're in production mode
  isProduction: (): boolean => {
    return getEnvVar('VITE_APP_ENVIRONMENT', { default: 'development' }) === 'production';
  },
  
  // Helper function to check if we're in test mode
  isTest: (): boolean => {
    return getEnvVar('VITE_APP_ENVIRONMENT', { default: 'development' }) === 'test';
  }
};

export default {
  getEnvVar,
  getBooleanEnvVar,
  getNumberEnvVar,
  getJsonEnvVar,
  env
}; 