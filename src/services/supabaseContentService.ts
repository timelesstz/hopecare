/**
 * Supabase Content Service
 * 
 * This service handles content-related operations using Supabase.
 * It replaces the Firebase-based content service with Supabase equivalents.
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { supabaseUserService } from './supabaseUserService';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string | null;
  status: string | null;
  categories: string[] | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  meta_description: string | null;
  featured_image: string | null;
  author_id: string | null;
  status: string | null;
  template: string | null;
  parent_id: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContentRevision {
  id: string;
  content_type: 'blog_post' | 'page';
  content_id: string;
  content: any;
  revision_number: number;
  created_by: string;
  created_at: string;
}

class SupabaseContentService {
  /**
   * Get blog posts with optional filtering and pagination
   */
  async getBlogPosts(options: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    tag?: string;
    searchTerm?: string;
    authorId?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    includeAuthor?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('blog_posts')
        .select(options.includeAuthor ? '*, users!author_id(email, display_name)' : '*');

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.category) {
        query = query.contains('categories', [options.category]);
      }

      if (options.tag) {
        query = query.contains('tags', [options.tag]);
      }

      if (options.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,excerpt.ilike.%${options.searchTerm}%`);
      }

      if (options.authorId) {
        query = query.eq('author_id', options.authorId);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'published_at';
      const sortDirection = options.sortDirection || 'desc';
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Process data to format author information if included
      const processedPosts = data?.map((post: any) => {
        if (options.includeAuthor && post.users) {
          const { users, ...postData } = post;
          return {
            ...postData,
            author: {
              id: post.author_id,
              email: users.email,
              display_name: users.display_name,
            },
          };
        }
        return post;
      });

      return {
        success: true,
        posts: processedPosts || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get blog posts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get blog posts',
      };
    }
  }

  /**
   * Get a single blog post by ID or slug
   */
  async getBlogPost(idOrSlug: string, options: { includeAuthor?: boolean } = {}) {
    try {
      // Determine if the parameter is an ID (UUID) or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase
        .from('blog_posts')
        .select(options.includeAuthor ? '*, users!author_id(email, display_name)' : '*');
      
      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      
      const { data, error } = await query.single();

      if (error) {
        throw error;
      }

      // Process data to format author information if included
      let processedPost = data;
      if (options.includeAuthor && data.users) {
        const { users, ...postData } = data;
        processedPost = {
          ...postData,
          author: {
            id: data.author_id,
            email: users.email,
            display_name: users.display_name,
          },
        };
      }

      return {
        success: true,
        post: processedPost,
      };
    } catch (error: any) {
      console.error('Get blog post error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get blog post',
      };
    }
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>, authorId: string) {
    try {
      const now = new Date().toISOString();
      
      // Generate slug if not provided
      if (!postData.slug) {
        postData.slug = this.generateSlug(postData.title);
      }
      
      // Check if slug already exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', postData.slug)
        .single();
      
      if (existingPost) {
        // Append a unique identifier to make the slug unique
        postData.slug = `${postData.slug}-${Date.now().toString().slice(-6)}`;
      }
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          author_id: authorId,
          created_at: now,
          updated_at: now,
        } as Database['public']['Tables']['blog_posts']['Insert'])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Create initial revision
      await this.createContentRevision({
        content_type: 'blog_post',
        content_id: data.id,
        content: postData.content,
        revision_number: 1,
        created_by: authorId,
      });

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'blog_post_create',
        entity_type: 'blog_post',
        entity_id: data.id,
        metadata: { title: postData.title },
      });

      return {
        success: true,
        postId: data.id,
        slug: postData.slug,
        message: 'Blog post created successfully',
      };
    } catch (error: any) {
      console.error('Create blog post error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create blog post',
      };
    }
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(postId: string, postData: Partial<BlogPost>, authorId: string) {
    try {
      // Get current post to determine if a new revision is needed
      const { data: currentPost, error: getError } = await supabase
        .from('blog_posts')
        .select('content, revision_count')
        .eq('id', postId)
        .single() as { 
          data: { content: any, revision_count: number } | null, 
          error: any 
        };

      if (getError) {
        throw getError;
      }

      const now = new Date().toISOString();
      const updateData = {
        ...postData,
        updated_at: now,
      } as Database['public']['Tables']['blog_posts']['Update'];
      
      // If slug is being updated, check for uniqueness
      if (postData.slug) {
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', postData.slug)
          .neq('id', postId)
          .single();
        
        if (existingPost) {
          // Append a unique identifier to make the slug unique
          updateData.slug = `${postData.slug}-${Date.now().toString().slice(-6)}`;
        }
      }
      
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // Create a new revision if content has changed
      if (postData.content && JSON.stringify(postData.content) !== JSON.stringify(currentPost?.content)) {
        const revisionNumber = (currentPost?.revision_count || 0) + 1;
        
        // Update revision count
        await supabase
          .from('blog_posts')
          .update({ revision_count: revisionNumber })
          .eq('id', postId);
        
        // Create revision
        await this.createContentRevision({
          content_type: 'blog_post',
          content_id: postId,
          content: postData.content,
          revision_number: revisionNumber,
          created_by: authorId,
        });
      }

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'blog_post_update',
        entity_type: 'blog_post',
        entity_id: postId,
        metadata: { title: postData.title },
      });

      return {
        success: true,
        message: 'Blog post updated successfully',
        slug: updateData.slug || postData.slug,
      };
    } catch (error: any) {
      console.error('Update blog post error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update blog post',
      };
    }
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(postId: string, authorId: string) {
    try {
      // Get post title for activity log
      const { data: post, error: getError } = await supabase
        .from('blog_posts')
        .select('title')
        .eq('id', postId)
        .single();

      if (getError) {
        throw getError;
      }

      // Delete post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'blog_post_delete',
        entity_type: 'blog_post',
        entity_id: postId,
        metadata: { title: post.title },
      });

      return {
        success: true,
        message: 'Blog post deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete blog post error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete blog post',
      };
    }
  }

  /**
   * Get pages with optional filtering and pagination
   */
  async getPages(options: {
    limit?: number;
    offset?: number;
    status?: string;
    parentId?: string | null;
    searchTerm?: string;
    authorId?: string;
    template?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    includeAuthor?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('pages')
        .select(options.includeAuthor ? '*, users!author_id(email, display_name)' : '*');

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.parentId !== undefined) {
        if (options.parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', options.parentId);
        }
      }

      if (options.template) {
        query = query.eq('template', options.template);
      }

      if (options.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,meta_description.ilike.%${options.searchTerm}%`);
      }

      if (options.authorId) {
        query = query.eq('author_id', options.authorId);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'sort_order';
      const sortDirection = options.sortDirection || 'asc';
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Process data to format author information if included
      const processedPages = data?.map((page: any) => {
        if (options.includeAuthor && page.users) {
          const { users, ...pageData } = page;
          return {
            ...pageData,
            author: {
              id: page.author_id,
              email: users.email,
              display_name: users.display_name,
            },
          };
        }
        return page;
      });

      return {
        success: true,
        pages: processedPages || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get pages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get pages',
      };
    }
  }

  /**
   * Get a single page by ID or slug
   */
  async getPage(idOrSlug: string, options: { includeAuthor?: boolean } = {}) {
    try {
      // Determine if the parameter is an ID (UUID) or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase
        .from('pages')
        .select(options.includeAuthor ? '*, users!author_id(email, display_name)' : '*');
      
      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      
      const { data, error } = await query.single();

      if (error) {
        throw error;
      }

      // Process data to format author information if included
      let processedPage = data;
      if (options.includeAuthor && data.users) {
        const { users, ...pageData } = data;
        processedPage = {
          ...pageData,
          author: {
            id: data.author_id,
            email: users.email,
            display_name: users.display_name,
          },
        };
      }

      return {
        success: true,
        page: processedPage,
      };
    } catch (error: any) {
      console.error('Get page error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get page',
      };
    }
  }

  /**
   * Create a new page
   */
  async createPage(pageData: Omit<Page, 'id' | 'created_at' | 'updated_at'>, authorId: string) {
    try {
      const now = new Date().toISOString();
      
      // Generate slug if not provided
      if (!pageData.slug) {
        pageData.slug = this.generateSlug(pageData.title);
      }
      
      // Check if slug already exists
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', pageData.slug)
        .single();
      
      if (existingPage) {
        // Append a unique identifier to make the slug unique
        pageData.slug = `${pageData.slug}-${Date.now().toString().slice(-6)}`;
      }
      
      // Set default sort order if not provided
      if (pageData.sort_order === undefined) {
        const { data: lastPage } = await supabase
          .from('pages')
          .select('sort_order')
          .is('parent_id', pageData.parent_id)
          .order('sort_order', { ascending: false })
          .limit(1)
          .single();
        
        pageData.sort_order = (lastPage?.sort_order || 0) + 10;
      }
      
      const { data, error } = await supabase
        .from('pages')
        .insert({
          ...pageData,
          author_id: authorId,
          created_at: now,
          updated_at: now,
        } as Database['public']['Tables']['pages']['Insert'])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Create initial revision
      await this.createContentRevision({
        content_type: 'page',
        content_id: data.id,
        content: pageData.content,
        revision_number: 1,
        created_by: authorId,
      });

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'page_create',
        entity_type: 'page',
        entity_id: data.id,
        metadata: { title: pageData.title },
      });

      return {
        success: true,
        pageId: data.id,
        slug: pageData.slug,
        message: 'Page created successfully',
      };
    } catch (error: any) {
      console.error('Create page error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create page',
      };
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(pageId: string, pageData: Partial<Page>, authorId: string) {
    try {
      // Get current page to determine if a new revision is needed
      const { data: currentPage, error: getError } = await supabase
        .from('pages')
        .select('content, revision_count')
        .eq('id', pageId)
        .single() as { 
          data: { content: any, revision_count: number } | null, 
          error: any 
        };

      if (getError) {
        throw getError;
      }

      const now = new Date().toISOString();
      const updateData = {
        ...pageData,
        updated_at: now,
      } as Database['public']['Tables']['pages']['Update'];
      
      // If slug is being updated, check for uniqueness
      if (pageData.slug) {
        const { data: existingPage } = await supabase
          .from('pages')
          .select('id')
          .eq('slug', pageData.slug)
          .neq('id', pageId)
          .single();
        
        if (existingPage) {
          // Append a unique identifier to make the slug unique
          updateData.slug = `${pageData.slug}-${Date.now().toString().slice(-6)}`;
        }
      }
      
      const { error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('id', pageId);

      if (error) {
        throw error;
      }

      // Create a new revision if content has changed
      if (pageData.content && JSON.stringify(pageData.content) !== JSON.stringify(currentPage?.content)) {
        const revisionNumber = (currentPage?.revision_count || 0) + 1;
        
        // Update revision count
        await supabase
          .from('pages')
          .update({ revision_count: revisionNumber })
          .eq('id', pageId);
        
        // Create revision
        await this.createContentRevision({
          content_type: 'page',
          content_id: pageId,
          content: pageData.content,
          revision_number: revisionNumber,
          created_by: authorId,
        });
      }

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'page_update',
        entity_type: 'page',
        entity_id: pageId,
        metadata: { title: pageData.title },
      });

      return {
        success: true,
        message: 'Page updated successfully',
        slug: updateData.slug || pageData.slug,
      };
    } catch (error: any) {
      console.error('Update page error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update page',
      };
    }
  }

  /**
   * Delete a page
   */
  async deletePage(pageId: string, authorId: string) {
    try {
      // Get page title for activity log
      const { data: page, error: getError } = await supabase
        .from('pages')
        .select('title')
        .eq('id', pageId)
        .single();

      if (getError) {
        throw getError;
      }

      // Delete page
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'page_delete',
        entity_type: 'page',
        entity_id: pageId,
        metadata: { title: page.title },
      });

      return {
        success: true,
        message: 'Page deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete page error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete page',
      };
    }
  }

  /**
   * Update page order
   */
  async updatePageOrder(pages: { id: string, sort_order: number }[], authorId: string) {
    try {
      // Update each page's sort order
      for (const page of pages) {
        const { error } = await supabase
          .from('pages')
          .update({ sort_order: page.sort_order })
          .eq('id', page.id);
        
        if (error) {
          throw error;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(authorId, {
        action: 'page_order_update',
        entity_type: 'pages',
        metadata: { count: pages.length },
      });

      return {
        success: true,
        message: 'Page order updated successfully',
      };
    } catch (error: any) {
      console.error('Update page order error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update page order',
      };
    }
  }

  /**
   * Get content revisions
   */
  async getContentRevisions(contentType: 'blog_post' | 'page', contentId: string) {
    try {
      const { data, error } = await supabase
        .from('content_revisions')
        .select('*, users!created_by(email, display_name)')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('revision_number', { ascending: false });

      if (error) {
        throw error;
      }

      // Process data to format author information
      const processedRevisions = data?.map((revision: any) => {
        const { users, ...revisionData } = revision;
        return {
          ...revisionData,
          author: {
            id: revision.created_by,
            email: users.email,
            display_name: users.display_name,
          },
        };
      });

      return {
        success: true,
        revisions: processedRevisions || [],
      };
    } catch (error: any) {
      console.error('Get content revisions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get content revisions',
      };
    }
  }

  /**
   * Create content revision
   */
  private async createContentRevision(revisionData: Omit<ContentRevision, 'id' | 'created_at'>) {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('content_revisions')
        .insert({
          ...revisionData,
          created_at: now,
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Create content revision error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create content revision',
      };
    }
  }

  /**
   * Generate a slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  }
}

export const supabaseContentService = new SupabaseContentService();
