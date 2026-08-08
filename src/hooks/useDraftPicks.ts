import { useState, useEffect } from 'react';
import { DraftPick } from '../types/index';
import { supabase } from '../lib/supabase';

// PostgREST caps a request at 1000 rows; the draft set is ~700 today but will
// grow every season, so page through rather than silently truncating.
const PAGE = 1000;

export function useDraftPicks() {
  const [data, setData] = useState<DraftPick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDraftPicks();
  }, []);

  const fetchDraftPicks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const all: DraftPick[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data: rows, error: err } = await supabase
          .from('draft_scatter')
          .select('*')
          .order('pick_number', { ascending: true })
          .range(from, from + PAGE - 1);

        if (err) throw err;
        if (!rows || rows.length === 0) break;

        all.push(...(rows as DraftPick[]));
        if (rows.length < PAGE) break;
      }

      setData(all);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch draft picks';
      setError(message);
      console.error('Error fetching draft picks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchDraftPicks();
  };

  return { data, isLoading, error, refetch };
}
