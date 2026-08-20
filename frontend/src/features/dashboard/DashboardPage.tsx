import { useDashboard } from './hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  RefreshCw,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { summary, isLoading, error, refetch } = useDashboard();

  const stats = [
    {
      title: 'Total Clientes',
      value: summary?.totalClients?.toString() || '0',
      detail: 'Clientes registrados',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Cuentas Activas',
      value: summary?.activeAccounts?.toString() || '0',
      detail: 'Cuentas de ahorro',
      icon: Wallet,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Saldo en Caja',
      value: summary?.currentCashRegister
        ? `$${Number(summary.currentCashRegister.currentBalance).toFixed(2)}`
        : 'Caja Cerrada',
      detail: summary?.currentCashRegister
        ? `Inicial: $${Number(summary.currentCashRegister.openingBalance).toFixed(2)}`
        : 'Sin caja abierta',
      icon: Landmark,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Depósitos Hoy',
      value: `$${Number(summary?.todayDeposits?.total || 0).toFixed(2)}`,
      detail: `${summary?.todayDeposits?.count || 0} transacción(es)`,
      icon: ArrowDownToLine,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/40',
    },
    {
      title: 'Retiros Hoy',
      value: `$${Number(summary?.todayWithdrawals?.total || 0).toFixed(2)}`,
      detail: `${summary?.todayWithdrawals?.count || 0} transacción(es)`,
      icon: ArrowUpFromLine,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Resumen operativo y transacciones de NexoCaja en tiempo real.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </div>
              <p className="text-xs text-zinc-500 mt-1">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Movements Section */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            Últimos Movimientos
          </CardTitle>
          <span className="text-xs text-zinc-500">
            Mostrando las últimas 10 operaciones
          </span>
        </CardHeader>
        <CardContent>
          {summary?.recentMovements && summary.recentMovements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Cuenta</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Cajero</th>
                    <th className="px-4 py-3">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {summary.recentMovements.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {m.type === 'DEPOSIT' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 hover:bg-green-100">
                            <ArrowDownToLine className="mr-1 h-3 w-3" /> Depósito
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 hover:bg-rose-100">
                            <ArrowUpFromLine className="mr-1 h-3 w-3" /> Retiro
                          </Badge>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 font-bold ${
                          m.type === 'DEPOSIT'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {m.type === 'DEPOSIT' ? '+' : '-'}$
                        {Number(m.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                        {m.account?.accountNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-medium">
                        {m.account?.client
                          ? `${m.account.client.firstName} ${m.account.client.lastName}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {m.user
                          ? `${m.user.firstName} ${m.user.lastName}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {new Date(m.createdAt).toLocaleString('es-EC')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">
                No hay movimientos registrados hoy.
              </p>
              <p className="text-xs text-zinc-400">
                Las nuevas operaciones aparecerán aquí en tiempo real.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
