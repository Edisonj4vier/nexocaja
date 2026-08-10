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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data.data);
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

  return {
    users,
    roles,
    isLoading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    toggleStatus,
  };
};
