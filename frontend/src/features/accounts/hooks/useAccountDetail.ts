import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import type { Account } from '@/types';

export function useAccountDetail(id: string | undefined) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/accounts/${id}`);
      setAccount(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al cargar el detalle de la cuenta',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return {
    account,
    isLoading,
    error,
    refetch: fetchAccount,
  };
}
