import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/axios';
import type { DashboardSummary } from '@/types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al cargar el resumen del dashboard',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
