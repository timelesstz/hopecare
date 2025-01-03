import { db } from '../db';

export interface ApiConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  type: 'text' | 'password' | 'email' | 'number' | 'boolean';
  category: 'smtp' | 'api' | 'general' | 'contact';
  is_sensitive: boolean;
  created_at: Date;
  updated_at: Date;
}

export const getConfigs = async (category?: string) => {
  try {
    const query = category
      ? 'SELECT * FROM api_configs WHERE category = $1 ORDER BY key'
      : 'SELECT * FROM api_configs ORDER BY category, key';
    
    const params = category ? [category] : [];
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching configs:', error);
    throw error;
  }
};

export const getConfigByKey = async (key: string) => {
  try {
    const result = await db.query(
      'SELECT * FROM api_configs WHERE key = $1',
      [key]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};

export const updateConfig = async (key: string, value: string) => {
  try {
    const result = await db.query(
      `UPDATE api_configs 
       SET value = $1, updated_at = NOW() 
       WHERE key = $2 
       RETURNING *`,
      [value, key]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};

export const createConfig = async (config: Omit<ApiConfig, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const result = await db.query(
      `INSERT INTO api_configs (key, value, description, type, category, is_sensitive)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [config.key, config.value, config.description, config.type, config.category, config.is_sensitive]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating config:', error);
    throw error;
  }
};

export const deleteConfig = async (key: string) => {
  try {
    const result = await db.query(
      'DELETE FROM api_configs WHERE key = $1 RETURNING *',
      [key]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting config:', error);
    throw error;
  }
};
