import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountDetail } from './hooks/useAccountDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Wallet,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Copy,
  Check,
  FileText,
  Calendar,
  Building,
  Users,
  Receipt,
} from 'lucide-react';
import { AccountStatementDialog } from './components/AccountStatementDialog';
import { TransactionVoucherModal } from '@/features/movements/components/TransactionVoucherModal';
import type { TransactionVoucher } from '@/types';
import api from '@/lib/axios';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account, isLoading, error } = useAccountDetail(id);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'movements' | 'beneficiaries' | 'accounting'>('movements');

  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<TransactionVoucher | null>(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  const handleOpenVoucher = async (movementId: string) => {
    try {
      const response = await api.get(`/movements/${movementId}/voucher`);
      setSelectedVoucher(response.data);
      setIsVoucherOpen(true);
    } catch (err) {
      console.error('Error al cargar voucher', err);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Cargando ficha de la cuenta...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cuenta no encontrada</h2>
        <p className="text-xs text-slate-500">{error || 'La cuenta solicitada no existe en el sistema.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/app/accounts')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Cuentas
        </Button>
      </div>
    );
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balance = Number(account.balance || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/accounts')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Volver al Listado de Cuentas</span>
        </button>

        {account.client && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/clients/${account.client?.id}`)}
            className="text-xs gap-1.5 h-8 font-semibold text-slate-700"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ver Ficha 360° del Socio</span>
          </Button>
        )}
      </div>

      {/* Main Account Financial Card */}
      <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                {account.product?.name || 'Cuenta de Ahorros'}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold uppercase ${
                  account.status === 'ACTIVE'
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                    : 'text-amber-400 bg-amber-950/60 border-amber-800'
                }`}
              >
                {account.status}
              </Badge>
            </div>

            {/* Titular Socio */}
            {account.client && (
              <h2 className="text-xl font-bold text-white mb-3">
                {account.client.lastName} {account.client.firstName}
              </h2>
            )}

            {/* Account Number with Copy */}
            <div className="flex items-center gap-2 font-mono text-sm text-slate-300">
              <span>N° {account.accountNumber}</span>
              <button
                onClick={handleCopyAccount}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copiar número"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Balance Section */}
          <div className="text-left md:text-right">
            <span className="text-xs uppercase font-medium text-slate-400 block tracking-wider">
              Saldo Disponible
            </span>
            <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
              ${balance.toFixed(2)}
            </div>
            <span className="text-xs text-emerald-400 font-semibold block mt-1">
              Tasa: {Number(account.interestRate || account.product?.interestRate || 0).toFixed(2)}% anual
            </span>
          </div>
        </div>

        {/* Quick Actions inside Card */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => navigate(`/app/movements?account=${account.accountNumber}&action=deposit`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 gap-1.5 font-semibold"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Depositar en Ventanilla
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/app/movements?account=${account.accountNumber}&action=withdrawal`)}
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs h-9 px-4 gap-1.5 font-medium"
            >
              <ArrowUpRight className="w-4 h-4" />
              Retirar en Ventanilla
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsStatementOpen(true)}
              className="border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs h-9 px-4 gap-1.5 font-semibold"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              Estado de Cuenta
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Agencia {account.agency || 'Matriz'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Apertura: {new Date(account.openedAt).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'movements'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Historial de Movimientos ({account.movements?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'beneficiaries'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Beneficiarios Designados ({account.beneficiaries?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('accounting')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'accounting'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Configuración Contable
        </button>
      </div>

      {/* TAB CONTENT: MOVIMIENTOS */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Extracto de Transacciones
              </h3>
              <span className="text-xs text-slate-400">Últimos movimientos registrados en ventanilla</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatementOpen(true)}
              className="text-xs gap-1.5 h-8 font-semibold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ver Estado de Cuenta Completo</span>
            </Button>
          </div>

          {account.movements && account.movements.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">FECHA Y HORA</th>
                  <th className="py-3 px-4">TIPO</th>
                  <th className="py-3 px-4">MONTO</th>
                  <th className="py-3 px-4">OPERADOR</th>
                  <th className="py-3 px-4">DETALLE</th>
                  <th className="py-3 px-4 text-center">COMPROBANTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {account.movements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString('es-ES')} {new Date(m.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          m.type === 'DEPOSIT'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.type === 'DEPOSIT' ? (
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        )}
                        {m.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${Number(m.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {m.user ? `${m.user.lastName} ${m.user.firstName}` : 'Caja'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {m.observations || 'Sin observaciones'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenVoucher(m.id)}
                        className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold gap-1"
                        title="Ver Boucher de esta operación"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Boucher</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay movimientos registrados en esta cuenta todavía.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BENEFICIARIOS */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Beneficiarios Registrados en Caso de Fallecimiento
              </h3>
              <p className="text-xs text-slate-400">Distribución porcentual legal de los fondos de la cuenta.</p>
            </div>
          </div>

          {account.beneficiaries && account.beneficiaries.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">BENEFICIARIO</th>
                    <th className="py-3 px-4">IDENTIFICACIÓN</th>
                    <th className="py-3 px-4">PARENTESCO</th>
                    <th className="py-3 px-4 text-right">PORCENTAJE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {account.beneficiaries.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-bold text-slate-800">{b.fullName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{b.identificationNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-700">{b.relationship}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 text-right">{Number(b.percentage)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No se han registrado beneficiarios en esta cuenta.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CONFIGURACIÓN CONTABLE */}
      {activeTab === 'accounting' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              Parametrización Contable Automática
            </h3>
            <p className="text-xs text-slate-400">Heredada del catálogo del producto financiero {account.product?.code || ''}.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Cuenta de Pasivo (Ahorro)
              </span>
              <strong className="text-slate-800 font-mono block">
                {account.product?.accountingAccount || '210101 - Depósitos de Ahorro'}
              </strong>
              <span className="text-[10px] text-slate-400">Balance exigible al socio</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Cuenta de Intereses (Gasto)
              </span>
              <strong className="text-slate-800 font-mono block">
                {account.product?.accountingInterest || '510201 - Gastos por Intereses'}
              </strong>
              <span className="text-[10px] text-slate-400">Causación mensual</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Cuenta de Caja Asociada
              </span>
              <strong className="text-slate-800 font-mono block">
                {account.product?.accountingCash || '110101 - Caja General'}
              </strong>
              <span className="text-[10px] text-slate-400">Flujo de ventanilla</span>
            </div>
          </div>
        </div>
      )}

      {/* Account Statement Dialog */}
      <AccountStatementDialog
        open={isStatementOpen}
        onOpenChange={setIsStatementOpen}
        accountId={account.id}
      />

      {/* Standalone Voucher Modal */}
      {selectedVoucher && (
        <TransactionVoucherModal
          open={isVoucherOpen}
          onOpenChange={setIsVoucherOpen}
          voucher={selectedVoucher}
        />
      )}
    </div>
  );
}

