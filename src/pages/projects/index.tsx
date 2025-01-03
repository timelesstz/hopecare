import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectGrid } from '@/components/ProjectGrid';
import { CMSCategory } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';

interface ProjectsPageProps {
  categories: CMSCategory[];
}

export default function ProjectsPage({ categories }: ProjectsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [status] = useState<'active' | 'completed' | 'draft'>('active');

  const { projects, loading, error } = useProjects({
    status,
    category: selectedCategory,
    limit: 12,
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading projects. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Support Our Projects
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Browse through our active projects and make a difference by supporting causes
          that matter to you. Every donation counts towards creating positive change.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${!selectedCategory
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            All Projects
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                ${selectedCategory === category.slug
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <ProjectGrid projects={projects} loading={loading} />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const categories = await cmsService.getCategories();
    
    return {
      props: {
        categories,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      props: {
        categories: [],
      },
      revalidate: 60,
    };
  }
}
