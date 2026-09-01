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
import { MoreHorizontal, Edit, Eye } from 'lucide-react';
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
  const columns: ColumnDef<Client>[] = [
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
      accessorKey: 'identificationNumber',
      header: 'Identificación',
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-zinc-500">{row.original.identificationType}</span>
          <br />
          <span className="font-medium font-mono text-sm text-zinc-900 dark:text-zinc-100">{row.original.identificationNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'firstName',
      header: 'Cliente',
      cell: ({ row }) => {
        const initials = `${row.original.firstName[0]}${row.original.lastName[0]}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="font-medium text-sm">
              {row.original.lastName} {row.original.firstName}
            </div>
          </div>
        );
      },
    },
    {
      id: 'contacto',
      header: 'Contacto',
      cell: ({ row }) => (
        <div>
          {row.original.email && <div className="text-sm text-zinc-600 dark:text-zinc-400">{row.original.email}</div>}
          {row.original.phone && <div className="text-xs text-zinc-500">{row.original.phone}</div>}
          {!row.original.email && !row.original.phone && <span className="text-zinc-400">—</span>}
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
                  Ver Detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
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
                  No hay clientes registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && setPage && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex-1 text-sm text-zinc-500">
            Página {pagination.page} de {pagination.lastPage} ({pagination.total} clientes)
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
