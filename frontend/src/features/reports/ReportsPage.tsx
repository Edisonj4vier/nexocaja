import { useState, useEffect } from 'react';
import { useReports } from './hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Users,
  Wallet,
  ArrowRightLeft,
  Landmark,
  Loader2,
  Calendar,
} from 'lucide-react';

type ReportType = 'movements' | 'clients' | 'accounts' | 'cash-registers';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('movements');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');

  const {
    reportData,
    isLoading,
    isExporting,
    error,
    fetchReportPreview,
    downloadFile,
  } = useReports();

  // Helper for date presets
  const applyPreset = (preset: 'today' | '7days' | 'month' | 'clear') => {
    const now = new Date();
    if (preset === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const getFilterParams = () => {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (selectedReport === 'movements' && movementTypeFilter !== 'ALL') {
      params.type = movementTypeFilter;
    }
    return params;
  };

  const handlePreview = () => {
    fetchReportPreview(selectedReport, getFilterParams());
  };

  const handleExport = (format: 'xlsx' | 'pdf') => {
    downloadFile(
      selectedReport,
      getFilterParams(),
      format,
      `reporte_${selectedReport}`,
    );
  };

  // Auto-fetch preview when switching report type
  useEffect(() => {
    fetchReportPreview(selectedReport, getFilterParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  const reportTabs = [
    {
      id: 'movements' as ReportType,
      label: 'Movimientos',
      icon: ArrowRightLeft,
      desc: 'Depósitos y retiros por fechas',
    },
    {
      id: 'clients' as ReportType,
      label: 'Clientes',
      icon: Users,
      desc: 'Padrón de clientes y saldos',
    },
    {
      id: 'accounts' as ReportType,
      label: 'Cuentas',
      icon: Wallet,
      desc: 'Cuentas de ahorro y aperturas',
    },
    {
      id: 'cash-registers' as ReportType,
      label: 'Cajas',
      icon: Landmark,
      desc: 'Arqueos y cierres diarios',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Centro de Reportes
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Genera, previsualiza y exporta reportes en formato Excel y PDF.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Report Types Grid / Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTabs.map((tab) => {
          const isSelected = selectedReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon
                  className={`w-5 h-5 ${
                    isSelected ? 'text-white dark:text-zinc-900' : 'text-zinc-500'
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-sm">{tab.label}</h3>
                  <p
                    className={`text-xs ${
                      isSelected
                        ? 'text-zinc-300 dark:text-zinc-600'
                        : 'text-zinc-400'
                    }`}
                  >
                    {tab.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Export Toolbar Card */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Filtros del Reporte</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('today')}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('7days')}
              >
                Últimos 7 días
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('month')}
              >
                Este Mes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyPreset('clear')}
              >
                Limpiar
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Configura los parámetros de consulta y selecciona el formato de salida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Fecha Inicio</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Fecha Fin</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic filter based on report */}
            {selectedReport === 'movements' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Tipo de Movimiento</Label>
                <Select
                  value={movementTypeFilter}
                  onValueChange={setMovementTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los tipos</SelectItem>
                    <SelectItem value="DEPOSIT">Solo Depósitos</SelectItem>
                    <SelectItem value="WITHDRAWAL">Solo Retiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedReport !== 'movements' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Estado</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    {selectedReport === 'cash-registers' ? (
                      <>
                        <SelectItem value="OPEN">Abierta</SelectItem>
                        <SelectItem value="CLOSED">Cerrada</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handlePreview}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Consultar
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Formatos disponibles para descarga inmediata:
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                Exportar Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                className="text-rose-700 hover:text-rose-800 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <FileText className="w-4 h-4 mr-2 text-rose-600" />
                Exportar PDF (.pdf)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Bar for Movements */}
      {selectedReport === 'movements' && reportData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Total Operaciones</p>
            <p className="text-xl font-bold mt-1">
              {reportData.summary.totalMovements}
            </p>
          </Card>
          <Card className="p-4 border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Total Depósitos</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              ${reportData.summary.totalDeposits}
            </p>
          </Card>
          <Card className="p-4 border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Total Retiros</p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              ${reportData.summary.totalWithdrawals}
            </p>
          </Card>
          <Card className="p-4 border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Flujo Neto</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">
              ${reportData.summary.netFlow}
            </p>
          </Card>
        </div>
      )}

      {/* Report Data Preview Table */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Vista Previa del Reporte</span>
            <span className="text-xs text-zinc-400 font-normal">
              {reportData?.data
                ? `Mostrando ${reportData.data.length} registros`
                : 'Sin datos'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-zinc-500">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-zinc-400" />
              <p className="text-sm font-medium">Cargando reporte...</p>
            </div>
          ) : reportData?.data && reportData.data.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm text-left">
                {/* 1. Movements Headers */}
                {selectedReport === 'movements' && (
                  <>
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Monto</th>
                        <th className="px-4 py-3">Cuenta</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Cajero</th>
                        <th className="px-4 py-3">Observaciones</th>
                        <th className="px-4 py-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {reportData.data.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3">
                            {row.type === 'DEPOSIT' ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200">
                                Depósito
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                                Retiro
                              </Badge>
                            )}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              row.type === 'DEPOSIT'
                                ? 'text-green-600'
                                : 'text-rose-600'
                            }`}
                          >
                            ${row.amount}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {row.accountNumber}
                          </td>
                          <td className="px-4 py-3">{row.clientName}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {row.cashier}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {row.observations}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {new Date(row.createdAt).toLocaleDateString('es-EC')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 2. Clients Headers */}
                {selectedReport === 'clients' && (
                  <>
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Identificación</th>
                        <th className="px-4 py-3">Nombre Completo</th>
                        <th className="px-4 py-3">Teléfono</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">N° Cuentas</th>
                        <th className="px-4 py-3">Saldo Total</th>
                        <th className="px-4 py-3">Registro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {reportData.data.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-mono text-xs">
                            {row.identificationType}: {row.identificationNumber}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {row.fullName}
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {row.phone}
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {row.email}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                row.status === 'ACTIVE'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.accountsCount}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            ${row.totalBalance}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {new Date(row.createdAt).toLocaleDateString('es-EC')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 3. Accounts Headers */}
                {selectedReport === 'accounts' && (
                  <>
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">N° Cuenta</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Identificación</th>
                        <th className="px-4 py-3">Saldo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Fecha de Apertura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {reportData.data.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-mono font-medium">
                            {row.accountNumber}
                          </td>
                          <td className="px-4 py-3">{row.clientName}</td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                            {row.clientIdentification}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            ${row.balance}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                row.status === 'ACTIVE'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {new Date(row.openedAt).toLocaleDateString('es-EC')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 4. Cash Registers Headers */}
                {selectedReport === 'cash-registers' && (
                  <>
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Cajero</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Saldo Inicial</th>
                        <th className="px-4 py-3">Saldo Cierre/Actual</th>
                        <th className="px-4 py-3">Movimientos</th>
                        <th className="px-4 py-3">Apertura</th>
                        <th className="px-4 py-3">Cierre</th>
                        <th className="px-4 py-3">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {reportData.data.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-medium">
                            {row.cashier}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                row.status === 'OPEN'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                              }
                            >
                              {row.status === 'OPEN' ? 'ABIERTA' : 'CERRADA'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">${row.openingBalance}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            ${row.closingBalance}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.movementsCount}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {new Date(row.openedAt).toLocaleString('es-EC')}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {row.closedAt !== '—'
                              ? new Date(row.closedAt).toLocaleString('es-EC')
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {row.observations}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">
                No se encontraron registros para los filtros seleccionados.
              </p>
              <p className="text-xs text-zinc-400">
                Prueba ajustando el rango de fechas o los filtros de búsqueda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
