import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from './hooks/useClients';
import type { Client } from '@/types';
import { ClientsTable } from './components/ClientsTable';
import { ClientWizardDialog } from './components/ClientWizardDialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadFile } from '@/lib/utils';
import { toast } from '@/stores/toast.store';

export default function ClientsPage() {
  const navigate = useNavigate();
  const {
    clients,
    pagination,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    exportClients,
  } = useClients();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchClients({ page, search: debouncedSearch, startDate, endDate });
  }, [fetchClients, page, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleCreate = () => {
    setSelectedClient(null);
    setIsWizardOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsWizardOpen(true);
  };

  const handleView = (client: Client) => {
    navigate(`/app/clients/${client.id}`);
  };

  const handleWizardSubmit = async (data: any) => {
    if (selectedClient) {
      const res = await updateClient(selectedClient.id, data);
      if (res) {
        toast.success(
          '¡Ficha de Socio Actualizada!',
          `Los datos de ${data.firstName} ${data.lastName} se actualizaron correctamente.`
        );
      }
    } else {
      const res = await createClient(data);
      if (res) {
        toast.success(
          '¡Socio Registrado Exitosamente!',
          `Se generó el expediente oficial ${res.memberCode || ''} para ${res.firstName} ${res.lastName}.`,
          {
            action: {
              label: 'Ver Ficha 360°',
              onClick: () => navigate(`/app/clients/${res.id}`),
            },
          }
        );
      }
    }
    setIsWizardOpen(false);
    fetchClients({ page, search: debouncedSearch, startDate, endDate });
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    const blob = await exportClients(format, { search: debouncedSearch, startDate, endDate });
    if (blob) {
      const filename = `socios_nexocaja.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      const contentType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      downloadFile(blob, filename, contentType);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Directorio de Socios
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Registro, expedientes integrales y estados de los socios de la caja comunitaria.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Socio
        </Button>
      </div>

      {/* Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        placeholder="Buscar por cédula, código (SOC-), apellidos o nombres..."
        onExportExcel={() => handleExport('excel')}
        onExportPdf={() => handleExport('pdf')}
        isExporting={isLoading}
      />

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-xs">
          {error}
        </div>
      )}

      {isLoading && !clients.length ? (
        <div className="text-center text-slate-400 py-12 text-xs">
          Cargando socios...
        </div>
      ) : (
        <ClientsTable
          data={clients}
          onEdit={handleEdit}
          onView={handleView}
          pagination={pagination}
          setPage={setPage}
        />
      )}

      {/* 4-Step Wizard Modal */}
      <ClientWizardDialog
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        client={selectedClient}
        onSubmit={handleWizardSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
