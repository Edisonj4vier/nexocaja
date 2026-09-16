import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  role: Role;
  roleId: string;
  lastLogin?: string;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, lastPage: 1 });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/users', { params });
      const result = response.data;
      
      if (result && Array.isArray(result.data)) {
        setUsers(result.data);
        const meta = result.meta || {};
        setPagination({
          total: meta.total ?? result.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (result?.data && Array.isArray(result.data.data)) {
        setUsers(result.data.data);
        const meta = result.data.meta || {};
        setPagination({
          total: meta.total ?? result.data.data.length,
          page: meta.page ?? 1,
          lastPage: meta.totalPages ?? meta.lastPage ?? 1,
        });
      } else if (Array.isArray(result)) {
        setUsers(result);
        setPagination({ total: result.length, page: 1, lastPage: 1 });
      } else {
        setUsers([]);
        setPagination({ total: 0, page: 1, lastPage: 1 });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err: any) {
      console.error('Error al cargar roles', err);
    }
  }, []);

  const createUser = async (data: any) => {
    try {
      setIsLoading(true);
      await api.post('/users', data);
      await fetchUsers();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
      setIsLoading(false);
      return false;
    }
  };

  const updateUser = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      await api.patch(`/users/${id}`, data);
      await fetchUsers();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      setIsLoading(false);
      return false;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      setIsLoading(true);
      await api.patch(`/users/${id}/status`);
      await fetchUsers();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
      setIsLoading(false);
      return false;
    }
  };

  const exportUsers = async (format: 'excel' | 'pdf', params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/export/${format}`, {
        params,
        responseType: 'blob', // Important for file download
      });
      return response.data;
    } catch (err: any) {
      setError('Error al exportar usuarios');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    pagination,
    roles,
    isLoading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    toggleStatus,
    exportUsers,
    clearError: () => setError(null),
  };
};
