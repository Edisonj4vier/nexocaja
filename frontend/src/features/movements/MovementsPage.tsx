import { useEffect, useState, useCallback } from 'react';
import { useMovements } from './hooks/useMovements';
import type { Movement } from '@/types';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { TransactionFormDialog } from './components/TransactionFormDialog';

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

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleFilterChange = useCallback((type: string) => {
    setFilterType(type);
    const params: Record<string, string> = {};
    if (type !== 'ALL') params.type = type;
    fetchMovements(params);
  }, [fetchMovements]);

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
            onClick={() => setIsDepositOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Depósito
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsWithdrawalOpen(true)}
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
      <TransactionFormDialog
        open={isDepositOpen}
        onOpenChange={setIsDepositOpen}
        type="deposit"
        onSubmit={deposit}
        isLoading={isLoading}
      />

      {/* Withdrawal Dialog */}
      <TransactionFormDialog
        open={isWithdrawalOpen}
        onOpenChange={setIsWithdrawalOpen}
        type="withdrawal"
        onSubmit={withdrawal}
        isLoading={isLoading}
      />
    </div>
  );
}
