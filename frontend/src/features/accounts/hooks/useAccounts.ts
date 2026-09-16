import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Account, Client } from '@/types';

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, lastPage: 1 });
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/accounts', { params });
      const result = response.data;

      if (result && Array.isArray(result.data)) {
        setAccounts(result.data);
        const meta = result.meta || {};
        setPagination({
          total: meta.total ?? result.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (result?.data && Array.isArray(result.data.data)) {
        setAccounts(result.data.data);
        const meta = result.data.meta || {};
        setPagination({
          total: meta.total ?? result.data.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (Array.isArray(result)) {
        setAccounts(result);
        setPagination({ total: result.length, page: 1, lastPage: 1 });
      } else {
        setAccounts([]);
        setPagination({ total: 0, page: 1, lastPage: 1 });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar cuentas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/clients');
      const data = response.data;
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      console.error('Error al cargar clientes', err);
    }
  }, []);

  const createAccount = async (clientId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/accounts', { clientId });
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cuenta');
      setIsLoading(false);
      return false;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.patch(`/accounts/${id}/status`);
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
      setIsLoading(false);
      return false;
    }
  };

  const exportAccounts = async (format: 'excel' | 'pdf', params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/accounts/export/${format}`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err: any) {
      setError('Error al exportar cuentas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    accounts,
    pagination,
    clients,
    isLoading,
    error,
    fetchAccounts,
    fetchClients,
    createAccount,
    toggleStatus,
    exportAccounts,
  };
};
