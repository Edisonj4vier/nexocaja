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
      const responseData = response.data.data;

      if (responseData && Array.isArray(responseData.data)) {
        setClients(responseData.data);
        setPagination({
          total: responseData.total || 0,
          page: responseData.page || 1,
          lastPage: responseData.lastPage || 1,
        });
      } else if (Array.isArray(responseData)) {
        setClients(responseData);
        setPagination({ total: responseData.length, page: 1, lastPage: 1 });
      } else {
        setClients([]);
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

  return {
    clients,
    pagination,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
  };
};
