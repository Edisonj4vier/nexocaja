import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import type { CashRegister } from '@/types';

export const useCashRegister = () => {
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/cash-registers/current');
      setCurrentRegister(response.data);
    } catch (err: any) {
      // 404 means no open register — that's expected
      if (err.response?.status === 404) {
        setCurrentRegister(null);
      } else {
        setError(err.response?.data?.message || 'Error al consultar caja');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openRegister = async (openingBalance: number, observations?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const payload: any = { openingBalance };
      if (observations) payload.observations = observations;
      const response = await api.post('/cash-registers/open', payload);
      setCurrentRegister(response.data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al abrir caja');
      setIsLoading(false);
      return false;
    }
  };

  const closeRegister = async (observations?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const payload: any = {};
      if (observations) payload.observations = observations;
      await api.post('/cash-registers/close', payload);
      setCurrentRegister(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar caja');
      setIsLoading(false);
      return false;
    }
  };

  return {
    currentRegister,
    isLoading,
    error,
    fetchCurrent,
    openRegister,
    closeRegister,
  };
};
