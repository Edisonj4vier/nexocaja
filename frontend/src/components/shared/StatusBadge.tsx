import { Badge } from '@/components/ui/badge';

type StatusType = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'OPEN' | 'CLOSED';

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  ACTIVE: { label: 'Activo', variant: 'default' },
  INACTIVE: { label: 'Inactivo', variant: 'destructive' },
  LOCKED: { label: 'Bloqueado', variant: 'destructive' },
  OPEN: { label: 'Abierta', variant: 'default' },
  CLOSED: { label: 'Cerrada', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
