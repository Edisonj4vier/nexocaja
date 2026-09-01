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
import { Badge } from '@/components/ui/badge';
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
      id: 'index',
      header: '#',
      cell: ({ row }) => (
        <span className="text-zinc-500 font-mono text-sm">
          {((pagination?.page || 1) - 1) * 10 + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'accountNumber',
      header: 'Nro. Cuenta',
      cell: ({ row }) => (
        <div>
          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{row.original.accountNumber}</span>
          <br />
          <Badge variant="outline" className="text-[10px] uppercase font-normal mt-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
            Ahorros
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Cliente',
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return '—';
        const initials = `${client.firstName[0]}${client.lastName[0]}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="font-medium text-sm">
              {client.lastName} {client.firstName}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Saldo</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
          ${Number(row.original.balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
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
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const account = row.original;
        const isActive = account.status === 'ACTIVE';

        return (
          <div className="text-right">
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
          </div>
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
