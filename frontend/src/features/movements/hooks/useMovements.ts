import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Movement } from '@/types';

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export const useMovements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async (params?: Record<string, string>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/movements', { params });
      const responseData = response.data.data;
      
      if (responseData && Array.isArray(responseData.data)) {
        setMovements(responseData.data);
        setPagination({
          total: responseData.total || 0,
          page: responseData.page || 1,
          lastPage: responseData.lastPage || 1,
        });
      } else if (Array.isArray(responseData)) {
        setMovements(responseData);
        setPagination({ total: responseData.length, page: 1, lastPage: 1 });
      } else {
        setMovements([]);
      }
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
    pagination,
    isLoading,
    error,
    fetchMovements,
    deposit,
    withdrawal,
  };
};
