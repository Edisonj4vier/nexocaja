import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, ArrowDownToLine, ArrowUpFromLine, Landmark } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Clientes', value: '0', icon: Users, color: 'text-blue-500' },
    { title: 'Cuentas Activas', value: '0', icon: Wallet, color: 'text-indigo-500' },
    { title: 'Saldo en Caja', value: '$0.00', icon: Landmark, color: 'text-emerald-500' },
    { title: 'Depósitos Hoy', value: '$0.00', icon: ArrowDownToLine, color: 'text-green-500' },
    { title: 'Retiros Hoy', value: '$0.00', icon: ArrowUpFromLine, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500">Resumen general de NexoCaja</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Aqui iran mas graficos o tablas de ultimos movimientos */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">No hay movimientos recientes para mostrar.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
