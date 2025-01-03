import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Content = Tables['contents']['Row'];
type Media = Tables['media']['Row'];
type Analytics = Tables['analytics']['Row'];

export const supabaseService = {
  // User Operations
  async createUser(email: string, name: string, role: User['role'] = 'VIEWER') {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name, role }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select();

    if (error) throw error;
    return data;
  },

  // Content Operations
  async createContent(content: Omit<Tables['contents']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contents')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContent(id: string, updates: Partial<Content>) {
    const { data, error } = await supabase
      .from('contents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteContent(id: string) {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getContentById(id: string) {
    const { data, error } = await supabase
      .from('contents')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllContent() {
    const { data, error } = await supabase
      .from('contents')
      .select();

    if (error) throw error;
    return data;
  },

  // Media Operations
  async uploadMedia(file: File, path: string) {
    const { data, error } = await supabase
      .storage
      .from('media')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  async createMediaRecord(media: Omit<Tables['media']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('media')
      .insert([media])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMedia(id: string, path: string) {
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('media')
      .remove([path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  },

  async getAllMedia() {
    const { data, error } = await supabase
      .from('media')
      .select();

    if (error) throw error;
    return data;
  },

  // Analytics Operations
  async trackEvent(type: string, value: number) {
    const { data, error } = await supabase
      .from('analytics')
      .insert([{ type, value }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAnalytics(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('analytics')
      .select()
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;
    return data;
  },

  // Authentication
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};
