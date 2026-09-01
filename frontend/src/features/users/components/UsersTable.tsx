import type {
  ColumnDef,
} from '@tanstack/react-table';
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
import { MoreHorizontal, Edit, Power, PowerOff } from 'lucide-react';
import type { User } from '../hooks/useUsers';

import type { PaginationMeta } from '../hooks/useUsers';

interface UsersTableProps {
  data: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  pagination?: PaginationMeta;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

export function UsersTable({
  data,
  currentUserId,
  onEdit,
  onToggleStatus,
  pagination,
  setPage,
}: UsersTableProps) {
  const columns: ColumnDef<User>[] = [
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
      accessorKey: 'firstName',
      header: 'Usuario',
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
      accessorKey: 'email',
      header: 'Contacto',
      cell: ({ row }) => (
        <span className="text-sm text-zinc-500">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role.name',
      header: 'Rol',
      cell: ({ row }) => <div>{row.original.role?.name || 'N/A'}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>
            {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === 'ACTIVE';

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
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {user.id !== currentUserId && (
                  <DropdownMenuItem onClick={() => onToggleStatus(user)}>
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
                )}
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && setPage && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex-1 text-sm text-zinc-500">
            Página {pagination.page} de {pagination.lastPage} ({pagination.total} usuarios)
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
