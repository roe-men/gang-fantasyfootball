import { useState, useEffect } from 'react';
import { OwnerStats } from '../types/index';
import { supabase } from '../lib/supabase';

export function useOwnerStats() {
  const [data, setData] = useState<OwnerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerStats();
  }, []);

  const fetchOwnerStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: stats, error: err } = await supabase
        .from('owner_stats')
        .select('*')
        .order('total_wins', { ascending: false });

      if (err) {
        throw err;
      }

      setData(stats || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      console.error('Error fetching owner stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchOwnerStats();
  };

  return { data, isLoading, error, refetch };
}
