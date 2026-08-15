import { useEffect, useState, useCallback } from 'react';
import { useClients } from './hooks/useClients';
import type { Client } from '@/types';
import { ClientsTable } from './components/ClientsTable';
import { ClientFormDialog } from './components/ClientFormDialog';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function ClientsPage() {
  const {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
  } = useClients();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = useCallback((value: string) => {
    fetchClients(value || undefined);
  }, [fetchClients]);

  const handleCreate = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleView = (client: Client) => {
    setViewClient(client);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, data);
    } else {
      await createClient(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registra y administra los clientes de la caja comunitaria.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <SearchInput
        placeholder="Buscar por nombre o identificación..."
        onSearch={handleSearch}
        className="max-w-sm"
      />

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {isLoading && !clients.length ? (
        <div className="text-center text-zinc-500 py-10">
          Cargando clientes...
        </div>
      ) : (
        <ClientsTable
          data={clients}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}

      <ClientFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={selectedClient}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      {/* Client Detail Dialog */}
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
          </DialogHeader>
          {viewClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Nombre Completo</p>
                  <p className="font-medium">{viewClient.firstName} {viewClient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Estado</p>
                  <StatusBadge status={viewClient.status} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Identificación</p>
                  <p className="font-medium">{viewClient.identificationType}: {viewClient.identificationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Teléfono</p>
                  <p className="font-medium">{viewClient.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="font-medium">{viewClient.email || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Dirección</p>
                  <p className="font-medium">{viewClient.address || '—'}</p>
                </div>
              </div>

              {viewClient.accounts && viewClient.accounts.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Cuentas ({viewClient.accounts.length})</p>
                  <div className="space-y-2">
                    {viewClient.accounts.map((acc) => (
                      <div key={acc.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md">
                        <div>
                          <p className="font-mono text-sm">{acc.accountNumber}</p>
                          <StatusBadge status={acc.status} />
                        </div>
                        <p className="font-bold text-lg">${Number(acc.balance).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
