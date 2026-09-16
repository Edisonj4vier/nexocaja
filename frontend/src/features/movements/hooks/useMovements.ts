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

  const fetchMovements = useCallback(async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/movements', { params });
      const result = response.data;
      
      if (result && Array.isArray(result.data)) {
        setMovements(result.data);
        const meta = result.meta || {};
        setPagination({
          total: meta.total ?? result.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (result?.data && Array.isArray(result.data.data)) {
        setMovements(result.data.data);
        const meta = result.data.meta || {};
        setPagination({
          total: meta.total ?? result.data.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (Array.isArray(result)) {
        setMovements(result);
        setPagination({ total: result.length, page: 1, lastPage: 1 });
      } else {
        setMovements([]);
        setPagination({ total: 0, page: 1, lastPage: 1 });
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

  const exportMovements = async (format: 'excel' | 'pdf', params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/movements/export/${format}`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err: any) {
      setError('Error al exportar movimientos');
      return null;
    } finally {
      setIsLoading(false);
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
    exportMovements,
  };
};
