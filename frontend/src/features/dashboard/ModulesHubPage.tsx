import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore, type ModuleType } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboard } from './hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LogOut,
  Users,
  Landmark,
  FileText,
  BarChart3,
  ShieldCheck,
  UserPlus,
  ArrowRightLeft,
  ArrowRight,
  Clock,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

export default function ModulesHubPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setActiveModule } = useUiStore();
  const { summary, isLoading, refetch } = useDashboard();

  // Clock state
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now);
      setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const roleName =
    typeof user?.role === 'string'
      ? user.role
      : (user?.role as any)?.name || 'USUARIO';
  const isAdmin = roleName === 'ADMIN';

  // Greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleNavigate = (moduleName: ModuleType, route: string) => {
    setActiveModule(moduleName);
    navigate(route);
  };

  // Cash Register State
  const cashRegister = summary?.currentCashRegister;
  const isCashOpen = !!cashRegister && cashRegister.status === 'OPEN';
  const cashBalance = cashRegister
    ? `$${Number(cashRegister.currentBalance).toFixed(2)}`
    : '$0.00';

  // Financial calculations
  const todayDepositsTotal = Number(summary?.todayDeposits?.total || 0);
  const todayWithdrawalsTotal = Number(summary?.todayWithdrawals?.total || 0);
  const netFlow = todayDepositsTotal - todayWithdrawalsTotal;

  // User Initials
  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || 'S'}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-zinc-50 to-slate-100/70 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col font-sans text-slate-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Logo & Branch */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-sm shadow-emerald-500/25">
            <span className="text-white font-bold text-base tracking-wider">N</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NexoCaja
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              Sucursal Matriz
            </span>
          </div>
        </div>

        {/* Center Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate || 'Cargando horario...'}</span>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Cash Register Pill */}
          <div
            onClick={() => handleNavigate('CAJAS', '/app/cash-register')}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xs hover:border-emerald-300"
            title="Ver estado de caja"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCashOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-slate-700 dark:text-zinc-300">
              {isCashOpen ? `Caja Abierta: ${cashBalance}` : 'Caja Cerrada'}
            </span>
          </div>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* User badge */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-xs">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                {user?.lastName ? `${user.lastName} ${user.firstName}` : user?.firstName || 'Usuario'}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {roleName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {user?.firstName || 'Edison'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Panel central de operaciones • Selecciona un módulo o ejecuta una acción directa.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => handleNavigate('ATENCION_CLIENTE', '/app/clients')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold text-xs h-9 px-3.5 gap-1.5 transition-all rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Socio
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNavigate('CAJAS', '/app/movements')}
              className="border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs h-9 px-3.5 gap-1.5 font-medium rounded-lg"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              Operación en Ventanilla
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNavigate('CAJAS', '/app/cash-register')}
              className="border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs h-9 px-3.5 gap-1.5 font-medium rounded-lg"
            >
              <Wallet className="w-4 h-4 text-slate-500" />
              {isCashOpen ? 'Arqueo de Caja' : 'Abrir Caja'}
            </Button>
          </div>
        </div>

        {/* Live Operational Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Socios Registrados
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.totalClients ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Base social activa</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Cuentas de Ahorro
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.activeAccounts ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Libretas vigentes</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Depósitos Hoy
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              ${todayDepositsTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary?.todayDeposits?.count ?? 0} operaciones
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Retiros Hoy
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              ${todayWithdrawalsTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary?.todayWithdrawals?.count ?? 0} operaciones
            </p>
          </div>
        </div>

        {/* Core Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Módulos del Sistema Financiero
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Acceso seguro con privilegios de {roleName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Atención al Cliente */}
            <div
              onClick={() => handleNavigate('ATENCION_CLIENTE', '/app/clients')}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-lg hover:border-emerald-400/80 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 border-emerald-200 dark:border-emerald-800/60 dark:text-emerald-400 dark:bg-emerald-950/40">
                    Socios & Cuentas
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Atención al Cliente
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Registro y administración de socios, apertura de libretas de ahorro y actualización de expedientes.
                </p>

                {/* Mini Stats inside Card */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Socios
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {summary?.totalClients ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Cuentas
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {summary?.activeAccounts ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Gestionar Socios y Cuentas</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Operaciones de Caja */}
            <div
              onClick={() => handleNavigate('CAJAS', '/app/cash-register')}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-lg hover:border-teal-400/80 dark:hover:border-teal-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/80 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold ${
                      isCashOpen
                        ? 'text-emerald-700 bg-emerald-50/70 border-emerald-200'
                        : 'text-amber-700 bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    {isCashOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                  Operaciones de Caja
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Apertura de turno, depósitos, retiros en efectivo en ventanilla, arqueo de valores y balance diario.
                </p>

                {/* Mini Stats inside Card */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Saldo en Caja
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {cashBalance}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Estado
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {isCashOpen ? 'En Operación' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 group-hover:translate-x-1 transition-transform">
                <span>Ir a Ventanilla de Caja</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Reportes y Auditoría */}
            <div
              onClick={() => handleNavigate('REPORTES', '/app/reports')}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-lg hover:border-blue-400/80 dark:hover:border-blue-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-800/80 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold text-blue-700 bg-blue-50/70 border-blue-200 dark:border-blue-800/60 dark:text-blue-400 dark:bg-blue-950/40">
                    PDF & Excel
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Reportes y Auditoría
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Historial detallado de transacciones, arqueos diarios, filtros por fecha y exportación de archivos oficiales.
                </p>

                {/* Mini Stats inside Card */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Depósitos
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      ${todayDepositsTotal.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Retiros
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      ${todayWithdrawalsTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Generar y Exportar Reportes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Visión Global (Dashboard) */}
            <div
              onClick={() => handleNavigate('DASHBOARD', '/app/dashboard')}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-lg hover:border-indigo-400/80 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/70 border-indigo-200 dark:border-indigo-800/60 dark:text-indigo-400 dark:bg-indigo-950/40">
                    Analítica
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Visión Global
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Gráficos de liquidez, flujo neto del día, comparación de ingresos y métricas globales de la sucursal.
                </p>

                {/* Mini Stats inside Card */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Flujo Neto Hoy
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {netFlow >= 0 ? `+$${netFlow.toFixed(2)}` : `-$${Math.abs(netFlow).toFixed(2)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Operaciones
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {(summary?.todayDeposits?.count || 0) + (summary?.todayWithdrawals?.count || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Ver Analítica Completa</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 5: Administración (Solo Admins) */}
            {isAdmin && (
              <div
                onClick={() => handleNavigate('ADMINISTRACION', '/app/users')}
                className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-lg hover:border-slate-400/80 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 group-hover:scale-110 group-hover:bg-slate-800 group-hover:text-white transition-all duration-300 shadow-xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold text-slate-700 bg-slate-100 border-slate-200 dark:border-zinc-700 dark:text-zinc-300 dark:bg-zinc-800">
                      Acceso Total
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-zinc-100 transition-colors">
                    Administración
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Gestión de usuarios y cajeros, asignación de perfiles, permisos y configuración de seguridad.
                  </p>

                  {/* Mini Stats inside Card */}
                  <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Usuarios
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                        {summary?.totalUsers ?? 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Seguridad
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        Activa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:translate-x-1 transition-transform">
                  <span>Administrar Usuarios</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom System Status Bar */}
        <div className="mt-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs border border-slate-200/80 dark:border-zinc-800 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Servidor Conectado y Sincronizado
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-zinc-700">•</span>
            <span className="hidden md:inline">Base de datos PostgreSQL Activa</span>
          </div>
          <div className="text-[11px] text-slate-400">
            NexoCaja Core v2.1 • Plataforma Financiera Cooperativa
          </div>
        </div>
      </main>
    </div>
  );
}
