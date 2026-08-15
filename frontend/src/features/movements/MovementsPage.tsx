import { useEffect, useState, useCallback } from 'react';
import { useMovements } from './hooks/useMovements';
import type { Movement, Account } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';
import api from '@/lib/axios';

export default function MovementsPage() {
  const {
    movements,
    isLoading,
    error,
    fetchMovements,
    deposit,
    withdrawal,
  } = useMovements();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form state for deposit/withdrawal
  const [accountSearch, setAccountSearch] = useState('');
  const [foundAccount, setFoundAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState('');
  const [observations, setObservations] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleFilterChange = useCallback((type: string) => {
    setFilterType(type);
    const params: Record<string, string> = {};
    if (type !== 'ALL') params.type = type;
    fetchMovements(params);
  }, [fetchMovements]);

  const searchAccount = async () => {
    if (!accountSearch.trim()) return;
    try {
      setSearchError('');
      setFoundAccount(null);
      const response = await api.get('/accounts', { params: { accountNumber: accountSearch.trim() } });
      const data = response.data;
      const accounts = Array.isArray(data) ? data : data.data || [];
      if (accounts.length > 0) {
        setFoundAccount(accounts[0]);
      } else {
        setSearchError('Cuenta no encontrada');
      }
    } catch {
      setSearchError('Error al buscar la cuenta');
    }
  };

  const resetForm = () => {
    setAccountSearch('');
    setFoundAccount(null);
    setAmount('');
    setObservations('');
    setSearchError('');
  };

  const handleDeposit = async () => {
    if (!foundAccount) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const payload: any = { accountId: foundAccount.id, amount: parsedAmount };
    if (observations.trim()) payload.observations = observations;

    const success = await deposit(payload);
    if (success) {
      setIsDepositOpen(false);
      resetForm();
    }
  };

  const handleWithdrawal = async () => {
    if (!foundAccount) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const payload: any = { accountId: foundAccount.id, amount: parsedAmount };
    if (observations.trim()) payload.observations = observations;

    const success = await withdrawal(payload);
    if (success) {
      setIsWithdrawalOpen(false);
      resetForm();
    }
  };

  const columns: ColumnDef<Movement>[] = [
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.original.type;
        return type === 'DEPOSIT' ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <ArrowDownToLine className="mr-1 h-3 w-3" /> Depósito
          </Badge>
        ) : (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
            <ArrowUpFromLine className="mr-1 h-3 w-3" /> Retiro
          </Badge>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => {
        const type = row.original.type;
        const color = type === 'DEPOSIT' ? 'text-green-600' : 'text-rose-600';
        const sign = type === 'DEPOSIT' ? '+' : '-';
        return (
          <span className={`font-bold ${color}`}>
            {sign}${Number(row.original.amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: 'account',
      header: 'Cuenta',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.account?.accountNumber || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'account.client',
      header: 'Cliente',
      cell: ({ row }) => {
        const client = row.original.account?.client;
        return client ? `${client.firstName} ${client.lastName}` : '—';
      },
    },
    {
      accessorKey: 'user',
      header: 'Cajero / Usuario',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.firstName} ${user.lastName}` : '—';
      },
    },
    {
      accessorKey: 'observations',
      header: 'Observaciones',
      cell: ({ row }) => row.original.observations || '—',
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('es-EC'),
    },
  ];

  const table = useReactTable({
    data: movements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Shared form for deposit/withdrawal
  const TransactionForm = ({ onSubmit, type }: { onSubmit: () => void; type: 'deposit' | 'withdrawal' }) => (
    <div className="space-y-4 pt-2">
      {/* Account search */}
      <div className="space-y-2">
        <Label>Buscar Cuenta</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Número de cuenta..."
            value={accountSearch}
            onChange={(e) => setAccountSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAccount()}
          />
          <Button variant="outline" size="icon" onClick={searchAccount}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {searchError && <p className="text-sm text-red-500">{searchError}</p>}
      </div>

      {/* Found account info */}
      {foundAccount && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md space-y-1">
          <p className="text-sm text-zinc-500">Cuenta encontrada:</p>
          <p className="font-mono font-medium">{foundAccount.accountNumber}</p>
          {foundAccount.client && (
            <p className="text-sm">{foundAccount.client.firstName} {foundAccount.client.lastName}</p>
          )}
          <p className="text-sm text-emerald-600 font-bold">
            Saldo: ${Number(foundAccount.balance).toFixed(2)}
          </p>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label>Monto ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!foundAccount}
        />
      </div>

      {/* Observations */}
      <div className="space-y-2">
        <Label>Observaciones <span className="text-zinc-400 text-xs">(Opcional)</span></Label>
        <Input
          placeholder="Notas de la transacción..."
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          disabled={!foundAccount}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            if (type === 'deposit') setIsDepositOpen(false);
            else setIsWithdrawalOpen(false);
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!foundAccount || !amount || isLoading}
          variant={type === 'withdrawal' ? 'destructive' : 'default'}
        >
          {isLoading
            ? 'Procesando...'
            : type === 'deposit'
              ? 'Registrar Depósito'
              : 'Registrar Retiro'
          }
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Movimientos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registra depósitos y retiros, y consulta el historial de movimientos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { resetForm(); setIsDepositOpen(true); }}
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Depósito
          </Button>
          <Button
            variant="destructive"
            onClick={() => { resetForm(); setIsWithdrawalOpen(true); }}
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Retiro
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-zinc-500">Filtrar por:</Label>
        <Select value={filterType} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="DEPOSIT">Depósitos</SelectItem>
            <SelectItem value="WITHDRAWAL">Retiros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No hay movimientos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={(open) => { setIsDepositOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-green-600" />
              Registrar Depósito
            </DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleDeposit} type="deposit" />
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawalOpen} onOpenChange={(open) => { setIsWithdrawalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-rose-600" />
              Registrar Retiro
            </DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleWithdrawal} type="withdrawal" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
