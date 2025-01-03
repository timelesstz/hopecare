import React, { createContext, useContext, useState } from 'react';

export interface Page {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: 'draft' | 'published';
  content: string;
  description?: string;
  heroImage?: string;
}

interface PageContextType {
  pages: Page[];
  updatePages: (pages: Page[]) => void;
  updatePage: (page: Page) => void;
  addPage: (page: Page) => void;
  deletePage: (id: string) => void;
  getPage: (id: string) => Page | undefined;
  getPageBySlug: (slug: string) => Page | undefined;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

const initialPages: Page[] = [
  {
    id: 'page-1',
    title: 'Home',
    slug: '/',
    order: 1,
    status: 'published',
    description: 'Welcome to our website. Discover our mission and services.',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    content: `
      <div class="prose prose-rose max-w-none">
        <h1>Welcome to Our Website</h1>
        <p>We are dedicated to making a difference in our community through innovative solutions and dedicated service.</p>
        <h2>Our Mission</h2>
        <p>To provide exceptional service and support to our community while maintaining the highest standards of quality and integrity.</p>
      </div>
    `
  },
  {
    id: 'page-2',
    title: 'About',
    slug: '/about',
    order: 2,
    status: 'published',
    description: 'Learn about our mission, values, and the impact we are making together.',
    heroImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80',
    content: `
      <div class="prose prose-rose max-w-none">
        <h1>About Us</h1>
        <p>Our story began with a simple idea: to make a positive impact in our community.</p>
        <h2>Our Values</h2>
        <ul>
          <li>Integrity in everything we do</li>
          <li>Community-focused approach</li>
          <li>Innovation and continuous improvement</li>
          <li>Sustainability and environmental responsibility</li>
        </ul>
      </div>
    `
  },
  {
    id: 'page-3',
    title: 'Contact',
    slug: '/contact',
    order: 3,
    status: 'published',
    description: 'Get in touch with us. We would love to hear from you.',
    heroImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80',
    content: `
      <div class="prose prose-rose max-w-none">
        <h1>Contact Us</h1>
        <p>We are here to help and answer any questions you might have.</p>
        <h2>Get in Touch</h2>
        <p>Email: contact@example.com<br>Phone: (555) 123-4567</p>
      </div>
    `
  }
];

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>(initialPages);

  const updatePages = (newPages: Page[]) => {
    setPages(newPages);
  };

  const updatePage = (updatedPage: Page) => {
    setPages(pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
  };

  const addPage = (page: Page) => {
    setPages([...pages, page]);
  };

  const deletePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
  };

  const getPage = (id: string) => {
    return pages.find(page => page.id === id);
  };

  const getPageBySlug = (slug: string) => {
    return pages.find(page => page.slug === slug);
  };

  return (
    <PageContext.Provider value={{ 
      pages, 
      updatePages, 
      updatePage, 
      addPage, 
      deletePage, 
      getPage, 
      getPageBySlug 
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePages = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
};