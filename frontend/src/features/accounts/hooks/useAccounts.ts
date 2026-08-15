import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Account, Client } from '@/types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (params?: Record<string, string>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/accounts', { params });
      const data = response.data;
      setAccounts(Array.isArray(data) ? data : data.data || []);
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

  return {
    accounts,
    clients,
    isLoading,
    error,
    fetchAccounts,
    fetchClients,
    createAccount,
    toggleStatus,
  };
};
