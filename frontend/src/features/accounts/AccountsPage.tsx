import { useEffect, useState } from 'react';
import { useAccounts } from './hooks/useAccounts';
import type { Account } from '@/types';
import { AccountsTable } from './components/AccountsTable';
import { AccountOpenDialog } from './components/AccountOpenDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadFile } from '@/lib/utils';

export default function AccountsPage() {
  const {
    accounts,
    pagination,
    isLoading,
    error,
    fetchAccounts,
    toggleStatus,
    exportAccounts,
  } = useAccounts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    account: Account | null;
  }>({ open: false, account: null });

  useEffect(() => {
    fetchAccounts({ page, search: debouncedSearch, startDate, endDate });
  }, [fetchAccounts, page, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleToggleStatus = (account: Account) => {
    setConfirmDialog({ open: true, account });
  };

  const handleConfirmToggle = async () => {
    if (confirmDialog.account) {
      await toggleStatus(confirmDialog.account.id);
      setConfirmDialog({ open: false, account: null });
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    const blob = await exportAccounts(format, { search: debouncedSearch, startDate, endDate });
    if (blob) {
      const filename = `cuentas_nexocaja.${format === 'excel' ? 'xlsx' : 'pdf'}`;
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
            Cuentas y Libretas Financieras
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Administración de libretas de ahorro, cuentas por producto y estados financieros.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Apertura de Cuenta
        </Button>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        placeholder="Buscar por número de cuenta, cédula o nombres del socio..."
        onExportExcel={() => handleExport('excel')}
        onExportPdf={() => handleExport('pdf')}
        isExporting={isLoading}
      />

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-xs">
          {error}
        </div>
      )}

      {isLoading && !accounts.length ? (
        <div className="text-center text-slate-400 py-12 text-xs">
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

      {/* Decoupled Account Open Dialog */}
      <AccountOpenDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          fetchAccounts({ page, search: debouncedSearch, startDate, endDate });
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, account: null })}
        title={confirmDialog.account?.status === 'ACTIVE' ? 'Bloquear Cuenta' : 'Reactivar Cuenta'}
        description={`¿Está seguro de que desea ${
          confirmDialog.account?.status === 'ACTIVE' ? 'bloquear' : 'reactivar'
        } la cuenta ${confirmDialog.account?.accountNumber}?`}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
