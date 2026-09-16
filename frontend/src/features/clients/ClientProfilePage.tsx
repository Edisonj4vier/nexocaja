import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient360 } from './hooks/useClient360';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientWizardDialog } from './components/ClientWizardDialog';
import { AccountOpenDialog } from '@/features/accounts/components/AccountOpenDialog';
import { useClients } from './hooks/useClients';
import { useUiStore } from '@/stores/ui.store';
import {
  ArrowLeft,
  User,
  Wallet,
  ArrowRightLeft,
  FileText,
  ShieldAlert,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  Pencil,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, isLoading, error, refetch } = useClient360(id);
  const { updateClient } = useClients();

  const [activeTab, setActiveTab] = useState<'accounts' | 'movements' | 'dossier' | 'documents' | 'audit'>('accounts');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Cargando expediente 360° del socio...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Socio no encontrado</h2>
        <p className="text-xs text-slate-500">{error || 'El socio solicitado no existe en el sistema.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/app/clients')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Button>
      </div>
    );
  }

  const handleEditSubmit = async (values: any) => {
    await updateClient(client.id, values);
    setIsEditOpen(false);
    refetch();
  };

  const isBlocked = client.status === 'BLOCKED';
  const totalSavings = Number(client.summary?.totalSavings || 0);
  const totalContributions = Number(client.summary?.totalContributions || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/clients')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Volver al Directorio de Socios</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="text-xs gap-1.5 h-8 font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar Datos
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAccountOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Abrir Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Hero 360 Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20">
              {client.lastName?.[0]}{client.firstName?.[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  {client.lastName} {client.firstName}
                </h1>
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-200"
                >
                  {client.memberCode || 'SOC-000000'}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-semibold ${
                    isBlocked
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {client.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">{client.identificationType}:</span>
                  <strong className="text-slate-700 dark:text-zinc-300">{client.identificationNumber}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.city || 'Quito'}, {client.province || 'Pichincha'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Afiliado: {client.affiliationDate ? new Date(client.affiliationDate).toLocaleDateString('es-ES') : 'Reciente'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick KPI Financial Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-8">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Total Ahorrado
              </span>
              <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                ${totalSavings.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">
                {client.summary?.activeAccountsCount ?? 0} cuenta(s) activa(s)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Aportaciones
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                ${totalContributions.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">
                Capital social
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Agencia
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                {client.agency || 'Matriz'}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                {client.memberType || 'Socio Activo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'accounts'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Cuentas y Productos ({client.accounts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'movements'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Historial Transaccional
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'dossier'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Expediente Completo
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Documentos Digitales
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Auditoría & Seguridad
        </button>
      </div>

      {/* TAB CONTENT: CUENTAS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              Libretas de Ahorro y Cuentas Vinculadas
            </h2>
            <Button
              size="sm"
              onClick={() => setIsAccountOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Aperturar Cuenta
            </Button>
          </div>

          {client.accounts && client.accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {client.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                        {acc.product?.name || 'Ahorro Básico'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          acc.status === 'ACTIVE'
                            ? 'text-emerald-700 bg-emerald-50/50'
                            : 'text-amber-700 bg-amber-50/50'
                        }`}
                      >
                        {acc.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Número de Cuenta
                    </p>
                    <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider mt-0.5">
                      {acc.accountNumber}
                    </p>

                    <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Saldo Disponible
                      </span>
                      <span className="text-2xl font-bold text-emerald-600 block mt-0.5">
                        ${Number(acc.balance).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tasa interés: {Number(acc.interestRate || acc.product?.interestRate || 0).toFixed(2)}% anual
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/accounts/${acc.id}`)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 p-0 font-semibold flex items-center gap-1"
                    >
                      <span>Ver Ficha de Cuenta</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        useUiStore.getState().setActiveModule('CAJAS');
                        navigate(`/app/movements?account=${acc.accountNumber}&action=deposit`);
                      }}
                      className="text-[11px] h-7 px-2.5"
                    >
                      Operar en Ventanilla
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">El socio no tiene cuentas registradas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Apertura una libreta de ahorros o cuenta de aportaciones para comenzar a registrar depósitos.
              </p>
              <Button
                size="sm"
                onClick={() => setIsAccountOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Aperturar Primera Cuenta
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MOVIMIENTOS */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              Últimas Transacciones en Ventanilla
            </h3>
            <span className="text-xs text-slate-400">Consolidado de todas sus cuentas</span>
          </div>

          {client.recentMovements && client.recentMovements.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">FECHA</th>
                  <th className="py-3 px-4">CUENTA</th>
                  <th className="py-3 px-4">TIPO</th>
                  <th className="py-3 px-4">MONTO</th>
                  <th className="py-3 px-4">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {client.recentMovements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString('es-ES')} {new Date(m.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-zinc-300">
                      {m.account?.accountNumber || 'Cuenta'}
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
                    <td className="py-3 px-4 text-slate-500">
                      {m.observations || 'Sin observaciones'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay movimientos registrados para este socio aún.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: EXPEDIENTE COMPLETO */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Información Personal y Civil
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tipo de Persona</span>
                <strong className="text-slate-700">{client.personType || 'NATURAL'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nombres y Apellidos</span>
                <strong className="text-slate-700">{client.lastName} {client.firstName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Identificación</span>
                <strong className="text-slate-700 font-mono">{client.identificationType}: {client.identificationNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Fecha de Nacimiento</span>
                <strong className="text-slate-700">{client.birthDate ? new Date(client.birthDate).toLocaleDateString('es-ES') : 'No especificada'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Género / Estado Civil</span>
                <strong className="text-slate-700">{client.gender || 'MASCULINO'} • {client.maritalStatus || 'SOLTERO'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nacionalidad</span>
                <strong className="text-slate-700">{client.nationality || 'Ecuatoriana'}</strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contacto y Domicilio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Teléfono Principal</span>
                <strong className="text-slate-700">{client.phone || 'No registrado'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Teléfono Secundario</span>
                <strong className="text-slate-700">{client.secondaryPhone || 'No registrado'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Correo Electrónico</span>
                <strong className="text-slate-700">{client.email || 'No registrado'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Ubicación Territorial</span>
                <strong className="text-slate-700">{client.city || 'Quito'}, {client.province || 'Pichincha'} ({client.parish || 'Central'})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Dirección</span>
                <strong className="text-slate-700">{client.address || 'No especificada'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Referencia</span>
                <strong className="text-slate-700">{client.addressReference || 'Sin referencia'}</strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Información Socioeconómica
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Ocupación</span>
                <strong className="text-slate-700">{client.occupation || 'No registrada'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Profesión</span>
                <strong className="text-slate-700">{client.profession || 'No registrada'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Empresa / Empleador</span>
                <strong className="text-slate-700">{client.employerCompany || 'Independiente'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Ingresos Mensuales Estimados</span>
                <strong className="text-emerald-600 font-bold">${Number(client.monthlyIncome || 0).toFixed(2)}</strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contacto de Emergencia / Referencia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nombres</span>
                <strong className="text-slate-700">{client.emergencyContactName || 'No registrado'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Parentesco</span>
                <strong className="text-slate-700">{client.emergencyContactRelationship || 'No registrado'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Teléfono</span>
                <strong className="text-slate-700">{client.emergencyContactPhone || 'No registrado'}</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTOS DIGITALES */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Expediente Digital del Socio
              </h3>
              <p className="text-xs text-slate-400">Requisitos de cumplimiento normativo y KYC.</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
              <Plus className="w-3.5 h-3.5" />
              Adjuntar Archivo
            </Button>
          </div>

          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">TIPO DE DOCUMENTO</th>
                  <th className="py-3 px-4">NOMBRE DE ARCHIVO</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700">Cédula de Identidad</td>
                  <td className="py-3 px-4 font-mono text-slate-500">cedula_{client.identificationNumber}.pdf</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Validado
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800">
                      Ver PDF
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700">Comprobante de Domicilio</td>
                  <td className="py-3 px-4 font-mono text-slate-500">planilla_servicios.pdf</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Validado
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800">
                      Ver PDF
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700">Contrato de Afiliación de Socio</td>
                  <td className="py-3 px-4 font-mono text-slate-500">contrato_adhesion_{client.memberCode || '001'}.pdf</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                      Firmado
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800">
                      Descargar
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDITORÍA */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Registro de Seguridad y Auditoría
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-slate-400 block">Estado Actual del Socio</span>
              <Badge variant="outline" className="text-xs font-bold text-emerald-700 bg-emerald-50">
                {client.status}
              </Badge>
              <p className="text-slate-500 text-[11px] pt-1">
                {client.statusReason || 'Expediente al día y habilitado para todas las operaciones.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-slate-400 block">Fechas Clave de Auditoría</span>
              <p className="text-slate-700">
                <strong>Registro Inicial:</strong> {new Date(client.createdAt).toLocaleString('es-ES')}
              </p>
              <p className="text-slate-700">
                <strong>Última Modificación:</strong> {new Date(client.updatedAt).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <ClientWizardDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        client={client}
        onSubmit={handleEditSubmit}
        isLoading={false}
      />

      {/* Open Account Dialog */}
      <AccountOpenDialog
        open={isAccountOpen}
        onOpenChange={setIsAccountOpen}
        preselectedClient={client}
        onSuccess={() => {
          setIsAccountOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
