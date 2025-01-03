import { useState, useEffect } from 'react';
import { CMSProject } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';

interface UseProjectsOptions {
  status?: 'active' | 'completed' | 'draft';
  category?: string;
  limit?: number;
  offset?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<CMSProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await cmsService.getProjects(options);
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [options.status, options.category, options.limit, options.offset]);

  return { projects, loading, error };
}
