import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users, UserCheck, Wallet, Landmark, ArrowRightLeft, FileText } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const isAdmin = user?.role?.name === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/', allowed: true },
    { name: 'Usuarios', icon: Users, path: '/users', allowed: isAdmin },
    { name: 'Clientes', icon: UserCheck, path: '/clients', allowed: true },
    { name: 'Cuentas', icon: Wallet, path: '/accounts', allowed: true },
    { name: 'Caja', icon: Landmark, path: '/cash-register', allowed: true },
    { name: 'Movimientos', icon: ArrowRightLeft, path: '/movements', allowed: true },
    { name: 'Reportes', icon: FileText, path: '/reports', allowed: true },
  ].filter((item) => item.allowed);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">NexoCaja</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Bienvenido, {user?.firstName} {user?.lastName}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {user?.role?.name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="w-5 h-5 text-zinc-500" />
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
