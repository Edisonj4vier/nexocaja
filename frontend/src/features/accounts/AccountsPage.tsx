import { useEffect, useState } from 'react';
import { useAccounts } from './hooks/useAccounts';
import type { Account } from '@/types';
import { AccountsTable } from './components/AccountsTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AccountsPage() {
  const {
    accounts,
    pagination,
    clients,
    isLoading,
    error,
    fetchAccounts,
    fetchClients,
    createAccount,
    toggleStatus,
  } = useAccounts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    account: Account | null;
  }>({ open: false, account: null });

  useEffect(() => {
    fetchAccounts({ page });
    fetchClients();
  }, [fetchAccounts, fetchClients, page]);

  const handleCreate = () => {
    setSelectedClientId('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!selectedClientId) return;
    const success = await createAccount(selectedClientId);
    if (success) {
      setIsCreateOpen(false);
    }
  };

  const handleToggleStatus = (account: Account) => {
    setConfirmDialog({ open: true, account });
  };

  const handleConfirmToggle = async () => {
    if (confirmDialog.account) {
      await toggleStatus(confirmDialog.account.id);
      setConfirmDialog({ open: false, account: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Gestión de Cuentas
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Administra las cuentas de ahorro de los clientes.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Abrir Cuenta
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {isLoading && !accounts.length ? (
        <div className="text-center text-zinc-500 py-10">
          Cargando cuentas...
        </div>
      ) : (
        <AccountsTable
          data={accounts}
          onToggleStatus={handleToggleStatus}
          pagination={pagination}
          setPage={setPage}
        />
      )}

      {/* Create Account Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Abrir Nueva Cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} — {client.identificationNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSubmit} disabled={!selectedClientId || isLoading}>
                {isLoading ? 'Creando...' : 'Abrir Cuenta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Toggle Status Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.account?.status === 'ACTIVE' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
        description={
          confirmDialog.account?.status === 'ACTIVE'
            ? `¿Estás seguro de desactivar la cuenta ${confirmDialog.account?.accountNumber}?`
            : `¿Deseas reactivar la cuenta ${confirmDialog.account?.accountNumber}?`
        }
        confirmLabel={confirmDialog.account?.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
        variant={confirmDialog.account?.status === 'ACTIVE' ? 'destructive' : 'default'}
        isLoading={isLoading}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
