import React, { createContext, useContext, useState, useCallback } from 'react';
import { CMSProject, CMSCategory } from '../types/cms';
import { supabase } from '../lib/supabaseClient';

interface CMSContextType {
  projects: CMSProject[];
  categories: CMSCategory[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  createProject: (project: Omit<CMSProject, 'id'>) => Promise<CMSProject>;
  updateProject: (id: string, project: Partial<CMSProject>) => Promise<CMSProject>;
  deleteProject: (id: string) => Promise<void>;
  createCategory: (category: Omit<CMSCategory, 'id'>) => Promise<CMSCategory>;
  updateCategory: (id: string, category: Partial<CMSCategory>) => Promise<CMSCategory>;
  deleteCategory: (id: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<CMSProject[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as CMSProject[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data as CMSCategory[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (project: Omit<CMSProject, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      await refreshProjects();
      return data as CMSProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProjects]);

  const updateProject = useCallback(async (id: string, project: Partial<CMSProject>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await refreshProjects();
      return data as CMSProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProjects]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProjects]);

  const createCategory = useCallback(async (category: Omit<CMSCategory, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      await refreshCategories();
      return data as CMSCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCategories]);

  const updateCategory = useCallback(async (id: string, category: Partial<CMSCategory>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await refreshCategories();
      return data as CMSCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCategories]);

  return (
    <CMSContext.Provider
      value={{
        projects,
        categories,
        loading,
        error,
        refreshProjects,
        refreshCategories,
        createProject,
        updateProject,
        deleteProject,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
