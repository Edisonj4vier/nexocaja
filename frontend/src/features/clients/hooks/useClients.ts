import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Client } from '@/types';

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/clients', { params });
      const result = response.data;

      if (result && Array.isArray(result.data)) {
        setClients(result.data);
        const meta = result.meta || {};
        setPagination({
          total: meta.total ?? result.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (result?.data && Array.isArray(result.data.data)) {
        setClients(result.data.data);
        const meta = result.data.meta || {};
        setPagination({
          total: meta.total ?? result.data.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (Array.isArray(result)) {
        setClients(result);
        setPagination({ total: result.length, page: 1, lastPage: 1 });
      } else {
        setClients([]);
        setPagination({ total: 0, page: 1, lastPage: 1 });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClient = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/clients', data);
      await fetchClients();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cliente');
      setIsLoading(false);
      return false;
    }
  };

  const updateClient = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.patch(`/clients/${id}`, data);
      await fetchClients();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar cliente');
      setIsLoading(false);
      return false;
    }
  };

  const exportClients = async (format: 'excel' | 'pdf', params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/clients/export/${format}`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err: any) {
      setError('Error al exportar clientes');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    pagination,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    exportClients,
  };
};
