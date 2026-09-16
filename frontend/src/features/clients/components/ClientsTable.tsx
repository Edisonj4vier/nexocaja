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
import { MoreHorizontal, Edit, Eye, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Client } from '@/types';
import type { PaginationMeta } from '../hooks/useClients';

interface ClientsTableProps {
  data: Client[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  pagination?: PaginationMeta;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

export function ClientsTable({
  data,
  onEdit,
  onView,
  pagination,
  setPage,
}: ClientsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<Client>[] = [
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
      accessorKey: 'memberCode',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          {row.original.memberCode || 'SOC-N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'identificationNumber',
      header: 'Identificación',
      cell: ({ row }) => (
        <div>
          <span className="text-[11px] text-slate-400 font-medium">
            {row.original.identificationType}
          </span>
          <br />
          <span className="font-mono font-semibold text-xs text-slate-800 dark:text-zinc-200">
            {row.original.identificationNumber}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'lastName',
      header: 'Socio / Titular',
      cell: ({ row }) => {
        const initials = `${row.original.lastName?.[0] || 'S'}${row.original.firstName?.[0] || 'C'}`.toUpperCase();
        return (
          <div
            onClick={() => navigate(`/app/clients/${row.original.id}`)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                <span>{row.original.lastName} {row.original.firstName}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] text-slate-400">
                {row.original.memberType || 'Socio Activo'} • {row.original.city || 'Quito'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'cuentas',
      header: 'Libretas',
      cell: ({ row }) => {
        const count = row.original._count?.accounts ?? (row.original.accounts?.length ?? 0);
        return (
          <Badge variant="outline" className="text-[11px] font-semibold text-slate-600 bg-slate-50">
            {count} {count === 1 ? 'cuenta' : 'cuentas'}
          </Badge>
        );
      },
    },
    {
      id: 'contacto',
      header: 'Contacto',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original.phone && (
            <div className="font-mono text-slate-700 dark:text-zinc-300 font-medium">
              {row.original.phone}
            </div>
          )}
          {row.original.email ? (
            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {row.original.email}
            </div>
          ) : (
            !row.original.phone && <span className="text-slate-400">—</span>
          )}
        </div>
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
        const client = row.original;
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
                <DropdownMenuItem onClick={() => onView(client)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Ficha 360°
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Datos
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
                  No hay socios registrados que coincidan con la búsqueda.
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
              Total: <span className="font-semibold text-slate-800 dark:text-zinc-200">{pagination.total}</span> {pagination.total === 1 ? 'socio registrado' : 'socios registrados'}
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
