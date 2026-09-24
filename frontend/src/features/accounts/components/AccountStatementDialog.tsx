import React, { useState, useEffect, useCallback } from 'react';
import type { AccountStatement, TransactionVoucher } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Printer,
  Calendar,
  Loader2,
  ShieldCheck,
  Building,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/utils';
import { TransactionVoucherModal } from '@/features/movements/components/TransactionVoucherModal';

interface AccountStatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export const AccountStatementDialog: React.FC<AccountStatementDialogProps> = ({
  open,
  onOpenChange,
  accountId,
}) => {
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected voucher to view
  const [selectedVoucher, setSelectedVoucher] = useState<TransactionVoucher | null>(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  const fetchStatement = useCallback(async (start?: string, end?: string) => {
    if (!accountId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      const response = await api.get(`/accounts/${accountId}/statement`, { params });
      setStatement(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener estado de cuenta');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (open && accountId) {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      setStartDate(startStr);
      setEndDate(endStr);
      fetchStatement(startStr, endStr);
    }
  }, [open, accountId, fetchStatement]);

  const handleApplyFilter = () => {
    fetchStatement(startDate, endDate);
  };

  const handlePreset = (type: 'thisMonth' | 'prevMonth' | 'quarter' | 'all') => {
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    if (type === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (type === 'prevMonth') {
      const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      start = firstDayPrev.toISOString().split('T')[0];
      end = lastDayPrev.toISOString().split('T')[0];
    } else if (type === 'quarter') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      start = threeMonthsAgo.toISOString().split('T')[0];
    } else if (type === 'all') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);
    fetchStatement(start, end);
  };

  const handleDownloadPdf = async () => {
    if (!accountId) return;
    try {
      setIsExporting(true);
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`/accounts/${accountId}/statement/pdf`, {
        params,
        responseType: 'blob',
      });

      const filename = `estado-cuenta-${statement?.account.accountNumber || accountId}.pdf`;
      downloadFile(response.data, filename, 'application/pdf');
    } catch (err) {
      console.error('Error al descargar PDF del estado de cuenta', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenVoucher = async (movementId: string) => {
    try {
      const response = await api.get(`/movements/${movementId}/voucher`);
      setSelectedVoucher(response.data);
      setIsVoucherOpen(true);
    } catch (err) {
      console.error('Error al cargar voucher', err);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[94vh] flex flex-col p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl">
          {/* Print Styles for Account Statement */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-statement, #printable-statement * {
                visibility: visible !important;
              }
              #printable-statement {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Dialog Header / Controls Bar */}
          <DialogHeader className="p-4 sm:px-6 sm:py-4 pr-14 sm:pr-20 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Estado de Cuenta Oficial</span>
                {statement && (
                  <Badge variant="outline" className="font-mono text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
                    {statement.account.accountNumber}
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Modelo oficial de conciliación contable y extracto de movimientos
              </p>
            </div>

            <div className="flex items-center gap-2 mr-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs gap-1.5 h-8 font-semibold bg-white dark:bg-zinc-800"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Imprimir
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isExporting || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? 'Generando PDF...' : 'Descargar PDF Oficial'}
              </Button>
            </div>
          </DialogHeader>

          {/* Filter Bar (No print) */}
          <div className="px-6 py-3 bg-slate-100/80 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Rango:
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-36 text-xs bg-white dark:bg-zinc-900"
              />
              <span className="text-slate-400">al</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-36 text-xs bg-white dark:bg-zinc-900"
              />
              <Button
                size="sm"
                onClick={handleApplyFilter}
                disabled={isLoading}
                className="h-8 px-3 text-xs bg-slate-800 hover:bg-slate-900 text-white"
              >
                Consultar
              </Button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 mr-1">Rápido:</span>
              <button
                type="button"
                onClick={() => handlePreset('thisMonth')}
                className="px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium text-[11px]"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => handlePreset('prevMonth')}
                className="px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium text-[11px]"
              >
                Mes Anterior
              </button>
              <button
                type="button"
                onClick={() => handlePreset('quarter')}
                className="px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium text-[11px]"
              >
                3 Meses
              </button>
              <button
                type="button"
                onClick={() => handlePreset('all')}
                className="px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium text-[11px]"
              >
                Todo
              </button>
            </div>
          </div>

          {/* Scrollable Document Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Generando extracto y conciliación...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 max-w-md mx-auto">
                {error}
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => fetchStatement(startDate, endDate)} className="gap-1 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Reintentar
                  </Button>
                </div>
              </div>
            ) : statement ? (
              /* Co-op Statement Document (Daquilema / Integración Solidaria style) */
              <div
                id="printable-statement"
                className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 w-full max-w-5xl mx-auto space-y-6"
              >
                {/* 1. Header Bar */}
                <div className="border-b-2 border-emerald-600 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                      NC
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                        COOP. NEXOCAJA LTDA.
                      </h1>
                      <p className="text-xs font-semibold text-emerald-700">
                        Caja de Ahorro y Crédito Comunitaria
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Pág. 1 / 1
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Generando desarrollo comunitario
                    </span>
                  </div>
                </div>

                {/* 2. Boxed Document Title */}
                <div className="flex justify-center">
                  <div className="border-2 border-emerald-600 rounded-lg px-8 py-2 bg-emerald-50/40 text-center shadow-2xs">
                    <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-slate-900 uppercase">
                      ESTADO DE CUENTA
                    </h2>
                  </div>
                </div>

                {/* 3. Two Boxes Metadata Grid (Daquilema style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                  {/* Left: Account & Socio Info */}
                  <div className="border border-slate-200 rounded-xl p-5 text-xs bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-200">
                      <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                        INFORMACIÓN DE LA CUENTA
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-2.5 py-0.5 rounded border border-slate-200">
                        {statement.client.memberCode || 'SOC-ACTIVO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-[125px_1fr] gap-x-3 gap-y-2.5 text-xs">
                      <span className="text-slate-500 font-medium">Socio:</span>
                      <span className="font-bold text-slate-900 uppercase">
                        {statement.client.fullName}
                      </span>

                      <span className="text-slate-500 font-medium">Identificación:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {statement.client.identificationType ? `${statement.client.identificationType}: ` : ''}{statement.client.identificationNumber}
                      </span>

                      <span className="text-slate-500 font-medium">N° Cuenta:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {statement.account.accountNumber}
                      </span>

                      <span className="text-slate-500 font-medium">Producto:</span>
                      <span className="text-slate-800 font-semibold">
                        {statement.account.productName}
                      </span>

                      <span className="text-slate-500 font-medium">Tipo:</span>
                      <span className="text-slate-700">
                        Ahorro a la Vista / Ordinaria
                      </span>

                      <span className="text-slate-500 font-medium">Teléfono:</span>
                      <span className="text-slate-700">
                        {statement.client.phone || 'S/N'}
                      </span>

                      <span className="text-slate-500 font-medium">Dirección:</span>
                      <span className="text-slate-700">
                        {statement.client.address || 'Quito, Ecuador'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Period & Conciliation Box */}
                  <div className="border border-slate-200 rounded-xl p-5 text-xs bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-200">
                      <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                        CONCILIACIÓN Y CORTE
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                        Periodo: {statement.period.startDate} al {statement.period.endDate}
                      </span>
                    </div>

                    <div className="space-y-3 py-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">SALDO ANTERIOR:</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          ${Number(statement.conciliation.saldoAnterior).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-emerald-700">
                        <span className="font-semibold">(+) CRÉDITOS:</span>
                        <span className="font-mono font-bold text-sm">
                          ${Number(statement.conciliation.totalCreditos).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-rose-700">
                        <span className="font-semibold">(-) DÉBITOS:</span>
                        <span className="font-mono font-bold text-sm">
                          ${Number(statement.conciliation.totalDebitos).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-200 font-extrabold text-slate-900">
                        <span className="text-xs">(=) SALDO ACTUAL:</span>
                        <span className="font-mono text-lg font-extrabold text-emerald-700">
                          ${Number(statement.conciliation.saldoActual).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.5 Security Seal Banner (Matches PDF design across full width) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>PRODUCTO PROTEGIDO POR EL FONDO DE RESGUARDO COMUNITARIO NEXOCAJA</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Verificación oficial de transacciones en línea
                  </span>
                </div>

                {/* 4. Movements Table (Exact Banking Reference) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-800 text-white text-[11px] font-bold px-3 py-2 flex justify-between items-center">
                    <span>DETALLE DE MOVIMIENTOS</span>
                    <span className="font-normal text-[10px] text-slate-300">
                      Total movimientos: {statement.movements.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-tight text-[10px]">
                        <tr>
                          <th className="py-2 px-2.5">Fecha</th>
                          <th className="py-2 px-2">Hora</th>
                          <th className="py-2 px-2.5">Transacción</th>
                          <th className="py-2 px-2.5">Detalle</th>
                          <th className="py-2 px-2">Documento</th>
                          <th className="py-2 px-2.5 text-right">Débitos</th>
                          <th className="py-2 px-2.5 text-right">Créditos</th>
                          <th className="py-2 px-3 text-right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statement.movements.length > 0 ? (
                          statement.movements.map((m, idx) => (
                            <tr
                              key={m.id}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                idx % 2 === 1 ? 'bg-slate-50/40' : ''
                              }`}
                            >
                              <td className="py-2 px-2.5 text-slate-600 font-medium whitespace-nowrap">
                                {m.date}
                              </td>
                              <td className="py-2 px-2 text-slate-500 text-[10px] whitespace-nowrap font-mono">
                                {m.time}
                              </td>
                              <td className="py-2 px-2.5 font-bold text-slate-800 text-[10px]">
                                {m.transaction}
                              </td>
                              <td className="py-2 px-2.5 text-slate-500 max-w-[160px] truncate" title={m.detail}>
                                {m.detail}
                              </td>
                              <td className="py-2 px-2 font-mono whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenVoucher(m.id)}
                                  className="text-emerald-700 hover:text-emerald-900 hover:underline font-semibold flex items-center gap-1 no-print"
                                  title="Ver Boucher de esta transacción"
                                >
                                  <span>{m.document}</span>
                                </button>
                                <span className="hidden print:inline">{m.document}</span>
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-medium text-rose-600">
                                {m.debit > 0 ? Number(m.debit).toFixed(2) : '0.00'}
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-medium text-emerald-600">
                                {m.credit > 0 ? Number(m.credit).toFixed(2) : '0.00'}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                ${Number(m.balance).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                              No se registraron movimientos en el rango de fechas seleccionado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Footer Signatures & Legal */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
                  <span>
                    NexoCaja Core Financiero © {new Date().getFullYear()} — Documento oficial no negociable
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Building className="w-3 h-3 text-emerald-600" />
                    Agencia {statement.account.agency || 'Matriz'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Linked Voucher Modal */}
      {selectedVoucher && (
        <TransactionVoucherModal
          open={isVoucherOpen}
          onOpenChange={setIsVoucherOpen}
          voucher={selectedVoucher}
        />
      )}
    </>
  );
};
