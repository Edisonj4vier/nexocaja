import { useNavigate } from 'react-router-dom';
import { useUiStore, type ModuleType } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Users,
  Wallet,
  Landmark,
  FileText,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

export default function ModulesHubPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setActiveModule } = useUiStore();

  const handleLogout = () => {
    logout();
  };

  const roleName =
    typeof user?.role === 'string'
      ? user.role
      : (user?.role as any)?.name || '';
  const isAdmin = roleName === 'ADMIN';

  const handleModuleClick = (moduleName: ModuleType, route: string) => {
    setActiveModule(moduleName);
    navigate(route);
  };

  const modules = [
    {
      id: 'ATENCION_CLIENTE',
      title: 'Atención al Cliente',
      description: 'Gestión de clientes, apertura de cuentas y consultas.',
      icon: Users,
      route: '/app/clients',
      color: 'bg-blue-500',
      allowed: true,
    },
    {
      id: 'CAJAS',
      title: 'Cajas y Operaciones',
      description: 'Apertura de caja, depósitos y retiros en ventanilla.',
      icon: Landmark,
      route: '/app/cash-register',
      color: 'bg-emerald-500',
      allowed: true,
    },
    {
      id: 'DASHBOARD',
      title: 'Visión Global',
      description: 'Métricas de rendimiento e indicadores financieros.',
      icon: BarChart3,
      route: '/app/dashboard',
      color: 'bg-indigo-500',
      allowed: true,
    },
    {
      id: 'ADMINISTRACION',
      title: 'Administración',
      description: 'Gestión de usuarios y configuración del sistema.',
      icon: ShieldAlert,
      route: '/app/users',
      color: 'bg-rose-500',
      allowed: isAdmin,
    },
    {
      id: 'REPORTES',
      title: 'Reportes',
      description: 'Historial de transacciones y exportación de datos.',
      icon: FileText,
      route: '/app/reports',
      color: 'bg-amber-500',
      allowed: true,
    },
  ].filter((m) => m.allowed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            NexoCaja
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {user?.lastName} {user?.firstName}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {roleName}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="w-5 h-5 text-zinc-500" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              ¿Qué deseas hacer hoy?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Selecciona un módulo para continuar con tus operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <button
                key={module.title}
                onClick={() => handleModuleClick(module.id as ModuleType, module.route)}
                className="group relative flex flex-col items-start p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 text-left overflow-hidden hover:border-blue-200 dark:hover:border-blue-900"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white ${module.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}
                >
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {module.description}
                </p>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <module.icon className="w-32 h-32 text-zinc-900 dark:text-white transform translate-x-4 -translate-y-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
