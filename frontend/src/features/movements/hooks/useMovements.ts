import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Movement } from '@/types';

export const useMovements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async (params?: Record<string, string>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/movements', { params });
      const data = response.data;
      setMovements(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar movimientos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = async (data: { accountId: string; amount: number; observations?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/movements/deposit', data);
      await fetchMovements();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar depósito');
      setIsLoading(false);
      return false;
    }
  };

  const withdrawal = async (data: { accountId: string; amount: number; observations?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/movements/withdrawal', data);
      await fetchMovements();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar retiro');
      setIsLoading(false);
      return false;
    }
  };

  return {
    movements,
    isLoading,
    error,
    fetchMovements,
    deposit,
    withdrawal,
  };
};
