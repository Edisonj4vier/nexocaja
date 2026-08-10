import { useEffect, useState } from 'react';
import { useUsers } from './hooks/useUsers';
import type { User } from './hooks/useUsers';
import { UsersTable } from './components/UsersTable';
import { UserFormDialog } from './components/UserFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  
  const {
    users,
    roles,
    isLoading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    toggleStatus,
  } = useUsers();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    if (
      confirm(
        `¿Estás seguro de que deseas ${
          user.status === 'ACTIVE' ? 'desactivar' : 'activar'
        } al usuario ${user.firstName} ${user.lastName}?`
      )
    ) {
      await toggleStatus(user.id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Administra los usuarios y cajeros del sistema.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {isLoading && !users.length ? (
        <div className="text-center text-zinc-500 py-10">
          Cargando usuarios...
        </div>
      ) : (
        <UsersTable
          data={users}
          currentUserId={currentUser?.id}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        roles={roles}
        currentUserId={currentUser?.id}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
