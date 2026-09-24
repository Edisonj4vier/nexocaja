import React, { useState } from 'react';
import type { TransactionVoucher } from '@/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode } from '@/components/shared/QrCode';
import {
  Printer,
  Download,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import api from '@/lib/axios';
import { downloadFile } from '@/lib/utils';

interface TransactionVoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: TransactionVoucher | null;
  onNewTransaction?: () => void;
}

export const TransactionVoucherModal: React.FC<TransactionVoucherModalProps> = ({
  open,
  onOpenChange,
  voucher,
  onNewTransaction,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!voucher) return null;

  const isDeposit = voucher.type === 'DEPOSIT';
  const operationTitle = isDeposit ? '¡Depósito exitoso!' : '¡Retiro exitoso!';

  const formattedDate = new Date(voucher.createdAt).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(voucher.createdAt).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.documentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get(`/movements/${voucher.id}/voucher/pdf`, {
        responseType: 'blob',
      });
      downloadFile(response.data, `comprobante-${voucher.documentNumber}.pdf`, 'application/pdf');
    } catch (err) {
      console.error('Error al descargar comprobante PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px] p-0 overflow-hidden border border-slate-200/80 shadow-2xl bg-white dark:bg-zinc-900 rounded-3xl">
        {/* Style sheet specifically for printing ONLY the voucher card */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-voucher, #printable-voucher * {
              visibility: visible !important;
            }
            #printable-voucher {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 16px !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Voucher Main Card (Pichincha / Produbanco style) */}
        <div id="printable-voucher" className="p-6 relative select-none">
          {/* Subtle security watermark background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Institutional Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                NC
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                NexoCaja
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <Building2 className="w-3 h-3 text-emerald-600" />
              <span>{voucher.agency || 'Matriz'}</span>
            </div>
          </div>

          {/* Success Check Badge & Title */}
          <div className="text-center pt-1 pb-3">
            <div
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white shadow-md mb-2.5 ${
                isDeposit
                  ? 'bg-emerald-500 shadow-emerald-500/20'
                  : 'bg-rose-500 shadow-rose-500/20'
              }`}
            >
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              {operationTitle}
            </h3>

            {/* Big Hero Amount */}
            <div
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-1 font-mono ${
                isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              ${Number(voucher.amount).toFixed(2)}
            </div>

            {/* Beneficiary / Titular */}
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {isDeposit ? 'A:' : 'De:'} {voucher.clientName}
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              El {formattedDate} a las {formattedTime}
            </p>
          </div>

          {/* Dotted Divider */}
          <div className="border-b border-dashed border-slate-200 dark:border-zinc-800 my-3" />

          {/* Detailed Specifications List */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Cuenta:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {voucher.accountNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Tipo de producto:</span>
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                {voucher.productName || 'Ahorros Ordinaria'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Institución:</span>
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                NexoCaja ({voucher.agency || 'Matriz'})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">N. de comprobante:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                <span>{voucher.documentNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-emerald-600 transition-colors no-print"
                  title="Copiar comprobante"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Cajero / Operador:</span>
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                {voucher.cashierName}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-400 font-medium">Saldo anterior:</span>
              <span className="font-mono text-slate-600 dark:text-zinc-400">
                ${Number(voucher.previousBalance).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400 font-semibold">
                Nuevo saldo disponible:
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${Number(voucher.newBalance).toFixed(2)}
              </span>
            </div>

            {voucher.observations && (
              <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                <span className="font-semibold text-slate-600 dark:text-zinc-400">Nota:</span>{' '}
                {voucher.observations}
              </div>
            )}
          </div>

          {/* QR Verification Section (Banco Pichincha style) */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800 text-center">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">
              Verificar la transacción con este QR.
            </p>
            <div className="flex justify-center">
              <QrCode
                value={`https://nexocaja.ec/valida/${voucher.documentNumber}`}
                size={110}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-1.5">
              HASH-SEC: {voucher.documentNumber}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 dark:bg-zinc-800/70 p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5 h-8 font-semibold bg-white dark:bg-zinc-900"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Imprimir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="text-xs gap-1.5 h-8 font-semibold bg-white dark:bg-zinc-900"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              {isDownloading ? 'Descargando...' : 'Descargar PDF'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onNewTransaction && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onNewTransaction();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
              >
                Nueva Operación
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 text-slate-500"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
