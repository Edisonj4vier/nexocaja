import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users, UserCheck, Wallet, Landmark, ArrowRightLeft, FileText, Grid, ArrowLeft } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { activeModule, setActiveModule } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleGoToHub = () => {
    setActiveModule(null);
    navigate('/');
  };

  // If no active module is selected, redirect to hub
  if (!activeModule) {
    return <Navigate to="/" replace />;
  }

  const roleName =
    typeof user?.role === 'string'
      ? user.role
      : (user?.role as any)?.name || '';
  const isAdmin = roleName === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/app/dashboard', module: 'DASHBOARD', allowed: true },
    { name: 'Usuarios', icon: Users, path: '/app/users', module: 'ADMINISTRACION', allowed: isAdmin },
    { name: 'Clientes', icon: UserCheck, path: '/app/clients', module: 'ATENCION_CLIENTE', allowed: true },
    { name: 'Cuentas', icon: Wallet, path: '/app/accounts', module: 'ATENCION_CLIENTE', allowed: true },
    { name: 'Caja', icon: Landmark, path: '/app/cash-register', module: 'CAJAS', allowed: true },
    { name: 'Movimientos', icon: ArrowRightLeft, path: '/app/movements', module: 'CAJAS', allowed: true },
    { name: 'Reportes', icon: FileText, path: '/app/reports', module: 'REPORTES', allowed: true },
  ].filter((item) => item.allowed && item.module === activeModule);

  // Module names for UI
  const moduleNames: Record<string, string> = {
    'DASHBOARD': 'Visión Global',
    'ATENCION_CLIENTE': 'Atención al Cliente',
    'CAJAS': 'Cajas y Operaciones',
    'ADMINISTRACION': 'Administración',
    'REPORTES': 'Reportes',
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800/50 gap-3">
          <Button variant="ghost" size="icon" onClick={handleGoToHub} title="Volver a los módulos">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Button>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {moduleNames[activeModule]}
            </h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 hidden md:block">
              Bienvenido, {user?.lastName} {user?.firstName}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleGoToHub} className="hidden sm:flex rounded-full border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Grid className="w-4 h-4 mr-2 text-zinc-500" />
              Ver Módulos
            </Button>
            <span className="text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full border border-primary/20">
              {roleName}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión" className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <LogOut className="w-5 h-5 text-zinc-500 hover:text-destructive transition-colors" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
