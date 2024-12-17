import { useState, useEffect } from 'react';
import { CMSDonationTier } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';

export function useDonationTiers(projectId?: string) {
  const [tiers, setTiers] = useState<CMSDonationTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        const data = await cmsService.getDonationTiers(projectId);
        setTiers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch donation tiers'));
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [projectId]);

  return { tiers, loading, error };
}
