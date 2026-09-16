import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import type { FinancialProduct } from '@/types';

export function useFinancialProducts() {
  const [products, setProducts] = useState<FinancialProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/financial-products');
      const data = response.data;
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al cargar productos financieros',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
