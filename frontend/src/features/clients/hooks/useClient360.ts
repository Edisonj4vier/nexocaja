import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import type { Client360 } from '@/types';

export function useClient360(id: string | undefined) {
  const [client, setClient] = useState<Client360 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient360 = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/clients/${id}/360`);
      setClient(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al cargar el expediente del socio',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient360();
  }, [fetchClient360]);

  return {
    client,
    isLoading,
    error,
    refetch: fetchClient360,
  };
}
