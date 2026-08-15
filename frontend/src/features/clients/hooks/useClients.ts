import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { Client } from '@/types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const response = await api.get('/clients', { params });
      const data = response.data;
      setClients(Array.isArray(data) ? data : data.data || []);
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
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
  };
};
