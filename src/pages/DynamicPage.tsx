import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePages } from '../context/PageContext';
import NotFound from './NotFound';
import AdminEditButton from '../components/AdminEditButton';
import PageHero from '../components/PageHero';

const DynamicPage = () => {
  const location = useLocation();
  const { getPageBySlug } = usePages();
  const page = getPageBySlug(location.pathname);

  if (!page || page.status !== 'published') {
    return <NotFound />;
  }

  return (
    <div>
      <PageHero
        title={page.title}
        description={page.description}
        image={page.heroImage}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminEditButton pageId={page.id.toString()} />
        <div 
          className="prose prose-rose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
      </div>
    </div>
  );
};

export default DynamicPage;