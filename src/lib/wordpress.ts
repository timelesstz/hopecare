import { WP_API_URL } from '../config';

export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  _embedded?: {
    author: Array<{
      name: string;
    }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export interface Page {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf: {
    [key: string]: any;
  };
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(
    `${WP_API_URL}/posts?_embed&per_page=10`
  );
  return response.json();
}

export async function fetchPost(slug: string): Promise<Post> {
  const response = await fetch(
    `${WP_API_URL}/posts?slug=${slug}&_embed`
  );
  const posts = await response.json();
  return posts[0];
}

export async function fetchPage(slug: string): Promise<Page> {
  const response = await fetch(
    `${WP_API_URL}/pages?slug=${slug}&_embed`
  );
  const pages = await response.json();
  return pages[0];
}

export async function fetchEvents(): Promise<any[]> {
  const response = await fetch(
    `${WP_API_URL}/events?_embed&per_page=10`
  );
  return response.json();
}

export async function fetchVolunteerOpportunities(): Promise<any[]> {
  const response = await fetch(
    `${WP_API_URL}/volunteer-opportunities?_embed&per_page=10`
  );
  return response.json();
}