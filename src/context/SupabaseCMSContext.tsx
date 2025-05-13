import React, { createContext, useContext, useState, useCallback } from 'react';
import { CMSProject, CMSCategory } from '../types/cms';
import { supabaseContentService } from '../services/supabaseContentService';
import { BlogPost, Page } from '../services/supabaseContentService';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface SupabaseCMSContextType {
  blogPosts: BlogPost[];
  pages: Page[];
  categories: CMSCategory[];
  loading: boolean;
  error: string | null;
  refreshBlogPosts: (options?: any) => Promise<void>;
  refreshPages: (options?: any) => Promise<void>;
  refreshCategories: () => Promise<void>;
  createBlogPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<BlogPost>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<BlogPost>;
  deleteBlogPost: (id: string) => Promise<void>;
  createPage: (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => Promise<Page>;
  updatePage: (id: string, page: Partial<Page>) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  createCategory: (category: Omit<CMSCategory, 'id'>) => Promise<CMSCategory>;
  updateCategory: (id: string, category: Partial<CMSCategory>) => Promise<CMSCategory>;
  deleteCategory: (id: string) => Promise<void>;
  getPageRevisions: (pageId: string) => Promise<any[]>;
  getBlogPostRevisions: (postId: string) => Promise<any[]>;
  updatePageOrder: (pages: { id: string, sort_order: number }[]) => Promise<void>;
}

const SupabaseCMSContext = createContext<SupabaseCMSContextType | undefined>(undefined);

export const SupabaseCMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBlogPosts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseContentService.getBlogPosts({
        includeAuthor: true,
        ...options
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch blog posts');
      }
      
      setBlogPosts(result.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPages = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseContentService.getPages({
        includeAuthor: true,
        ...options
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pages');
      }
      
      setPages(result.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get categories from Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setCategories(data as CMSCategory[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlogPost = useCallback(async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a blog post');
      }
      
      const result = await supabaseContentService.createBlogPost(post, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create blog post');
      }
      
      // Get the newly created post
      const postResult = await supabaseContentService.getBlogPost(result.postId, { includeAuthor: true });
      
      if (!postResult.success) {
        throw new Error(postResult.error || 'Failed to retrieve created blog post');
      }
      
      const newPost = postResult.post;
      
      // Update local state
      setBlogPosts(prev => [newPost, ...prev]);
      
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlogPost = useCallback(async (id: string, post: Partial<BlogPost>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update a blog post');
      }
      
      const result = await supabaseContentService.updateBlogPost(id, post, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update blog post');
      }
      
      // Get the updated post
      const postResult = await supabaseContentService.getBlogPost(id, { includeAuthor: true });
      
      if (!postResult.success) {
        throw new Error(postResult.error || 'Failed to retrieve updated blog post');
      }
      
      const updatedPost = postResult.post;
      
      // Update local state
      setBlogPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlogPost = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete a blog post');
      }
      
      const result = await supabaseContentService.deleteBlogPost(id, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete blog post');
      }
      
      // Update local state
      setBlogPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPage = useCallback(async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a page');
      }
      
      const result = await supabaseContentService.createPage(page, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create page');
      }
      
      // Get the newly created page
      const pageResult = await supabaseContentService.getPage(result.pageId, { includeAuthor: true });
      
      if (!pageResult.success) {
        throw new Error(pageResult.error || 'Failed to retrieve created page');
      }
      
      const newPage = pageResult.page;
      
      // Update local state
      setPages(prev => [newPage, ...prev]);
      
      return newPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePage = useCallback(async (id: string, page: Partial<Page>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update a page');
      }
      
      const result = await supabaseContentService.updatePage(id, page, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update page');
      }
      
      // Get the updated page
      const pageResult = await supabaseContentService.getPage(id, { includeAuthor: true });
      
      if (!pageResult.success) {
        throw new Error(pageResult.error || 'Failed to retrieve updated page');
      }
      
      const updatedPage = pageResult.page;
      
      // Update local state
      setPages(prev => prev.map(p => p.id === id ? updatedPage : p));
      
      return updatedPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePage = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete a page');
      }
      
      const result = await supabaseContentService.deletePage(id, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete page');
      }
      
      // Update local state
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (category: Omit<CMSCategory, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date().toISOString();
      const newCategory = {
        id: uuidv4(),
        ...category,
        created_at: now,
        updated_at: now
      } as CMSCategory;
      
      // Insert into Supabase
      const { error } = await supabase
        .from('categories')
        .insert(newCategory);
      
      if (error) {
        throw error;
      }
      
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
      setError(null);
      
      const now = new Date().toISOString();
      const updateData = {
        ...category,
        updated_at: now
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Get the updated category
      const updatedCategory = {
        ...categories.find(c => c.id === id),
        ...category,
        updated_at: now
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
      setError(null);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBlogPostRevisions = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseContentService.getContentRevisions('blog_post', postId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get blog post revisions');
      }
      
      return result.revisions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get blog post revisions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPageRevisions = useCallback(async (pageId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseContentService.getContentRevisions('page', pageId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get page revisions');
      }
      
      return result.revisions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get page revisions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePageOrder = useCallback(async (pagesToUpdate: { id: string, sort_order: number }[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update page order');
      }
      
      const result = await supabaseContentService.updatePageOrder(pagesToUpdate, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update page order');
      }
      
      // Update local state
      setPages(prev => {
        const updated = [...prev];
        pagesToUpdate.forEach(page => {
          const index = updated.findIndex(p => p.id === page.id);
          if (index !== -1) {
            updated[index] = { ...updated[index], sort_order: page.sort_order };
          }
        });
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SupabaseCMSContext.Provider
      value={{
        blogPosts,
        pages,
        categories,
        loading,
        error,
        refreshBlogPosts,
        refreshPages,
        refreshCategories,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        createPage,
        updatePage,
        deletePage,
        createCategory,
        updateCategory,
        deleteCategory,
        getBlogPostRevisions,
        getPageRevisions,
        updatePageOrder,
      }}
    >
      {children}
    </SupabaseCMSContext.Provider>
  );
};

export const useSupabaseCMS = () => {
  const context = useContext(SupabaseCMSContext);
  if (context === undefined) {
    throw new Error('useSupabaseCMS must be used within a SupabaseCMSProvider');
  }
  return context;
};
