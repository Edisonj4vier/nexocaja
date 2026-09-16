import { useNavigate } from 'react-router-dom';
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
import { MoreHorizontal, Power, PowerOff, Eye, ArrowUpRight } from 'lucide-react';
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
  const navigate = useNavigate();

  const columns: ColumnDef<Account>[] = [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => (
        <span className="text-slate-400 font-mono text-xs">
          {((pagination?.page || 1) - 1) * 10 + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'accountNumber',
      header: 'Nro. Cuenta',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/app/accounts/${row.original.id}`)}
          className="cursor-pointer group inline-block"
        >
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
              {row.original.accountNumber}
            </span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-medium mt-1 bg-emerald-50/50 text-emerald-800 border-emerald-200/60"
          >
            {row.original.product?.name || 'Ahorros Básica'}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Socio Titular',
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return '—';
        const initials = `${client.lastName?.[0] || 'S'}${client.firstName?.[0] || 'C'}`.toUpperCase();
        return (
          <div
            onClick={() => client.id && navigate(`/app/clients/${client.id}`)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 group-hover:border-emerald-300 flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 transition-colors">
                {client.lastName} {client.firstName}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {client.identificationNumber} {client.memberCode ? `• ${client.memberCode}` : ''}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Saldo</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
          ${Number(row.original.balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'openedAt',
      header: 'Apertura',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {new Date(row.original.openedAt).toLocaleDateString('es-EC')}
        </span>
      ),
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
                <DropdownMenuItem onClick={() => navigate(`/app/accounts/${account.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Ficha de Cuenta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(account)}>
                  {isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4 text-rose-500" />
                      Bloquear Cuenta
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4 text-emerald-500" />
                      Reactivar Cuenta
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
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-800/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-slate-600 dark:text-zinc-300 py-3.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-400 text-xs"
                >
                  No hay cuentas registradas que coincidan con los filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && setPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 px-2 py-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span>
              Página <span className="font-semibold text-slate-800 dark:text-zinc-200">{pagination.page}</span> de{' '}
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{Math.max(pagination.lastPage, 1)}</span>
            </span>
            <span className="text-slate-300 dark:text-zinc-600">•</span>
            <span>
              Total: <span className="font-semibold text-slate-800 dark:text-zinc-200">{pagination.total}</span> {pagination.total === 1 ? 'cuenta registrada' : 'cuentas registradas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={pagination.page <= 1}
              className="text-xs h-8 px-3"
            >
              Anterior
            </Button>
            <div className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-300 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200/50 dark:border-zinc-700/50">
              {pagination.page} / {Math.max(pagination.lastPage, 1)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, pagination.lastPage))}
              disabled={pagination.page >= pagination.lastPage}
              className="text-xs h-8 px-3"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
