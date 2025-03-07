import React, { createContext, useContext, useState, useCallback } from 'react';
import { CMSProject, CMSCategory } from '../types/cms';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

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
      
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CMSProject[];
      
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CMSCategory[];
      
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (project: Omit<CMSProject, 'id'>) => {
    try {
      setLoading(true);
      
      // Add timestamp fields
      const projectWithTimestamps = {
        ...project,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'projects'), projectWithTimestamps);
      
      // Get the new project with ID
      const newProject = {
        id: docRef.id,
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CMSProject;
      
      // Update local state
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, project: Partial<CMSProject>) => {
    try {
      setLoading(true);
      
      // Add updated timestamp
      const projectWithTimestamp = {
        ...project,
        updated_at: serverTimestamp()
      };
      
      // Update in Firestore
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, projectWithTimestamp);
      
      // Get the updated project
      const updatedProject = {
        id,
        ...projects.find(p => p.id === id),
        ...project,
        updated_at: new Date().toISOString()
      } as CMSProject;
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from Firestore
      const projectRef = doc(db, 'projects', id);
      await deleteDoc(projectRef);
      
      // Update local state
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (category: Omit<CMSCategory, 'id'>) => {
    try {
      setLoading(true);
      
      // Add timestamp fields
      const categoryWithTimestamps = {
        ...category,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'categories'), categoryWithTimestamps);
      
      // Get the new category with ID
      const newCategory = {
        id: docRef.id,
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CMSCategory;
      
      // Update local state
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, category: Partial<CMSCategory>) => {
    try {
      setLoading(true);
      
      // Add updated timestamp
      const categoryWithTimestamp = {
        ...category,
        updated_at: serverTimestamp()
      };
      
      // Update in Firestore
      const categoryRef = doc(db, 'categories', id);
      await updateDoc(categoryRef, categoryWithTimestamp);
      
      // Get the updated category
      const updatedCategory = {
        id,
        ...categories.find(c => c.id === id),
        ...category,
        updated_at: new Date().toISOString()
      } as CMSCategory;
      
      // Update local state
      setCategories(prev => 
        prev.map(c => c.id === id ? updatedCategory : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from Firestore
      const categoryRef = doc(db, 'categories', id);
      await deleteDoc(categoryRef);
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
