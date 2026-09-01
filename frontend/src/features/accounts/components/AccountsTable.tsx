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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Power, PowerOff } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Account } from '@/types';
import type { PaginationMeta } from '../hooks/useAccounts';

interface AccountsTableProps {
  data: Account[];
  onToggleStatus: (account: Account) => void;
  pagination?: PaginationMeta;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

export function AccountsTable({
  data,
  onToggleStatus,
  pagination,
  setPage,
}: AccountsTableProps) {
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'accountNumber',
      header: 'Nro. Cuenta',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.accountNumber}</span>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Cliente',
      cell: ({ row }) => {
        const client = row.original.client;
        return client ? `${client.firstName} ${client.lastName}` : '—';
      },
    },
    {
      accessorKey: 'balance',
      header: 'Saldo',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          ${Number(row.original.balance).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'openedAt',
      header: 'Fecha Apertura',
      cell: ({ row }) => new Date(row.original.openedAt).toLocaleDateString('es-EC'),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') as string} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const account = row.original;
        const isActive = account.status === 'ACTIVE';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onToggleStatus(account)}>
                {isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Desactivar</span>
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-500">Activar</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
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
                  No hay cuentas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && setPage && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex-1 text-sm text-zinc-500">
            Página {pagination.page} de {pagination.lastPage} ({pagination.total} cuentas)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.lastPage, p + 1))}
              disabled={pagination.page >= pagination.lastPage}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
