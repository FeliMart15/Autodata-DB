import {  useState  } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Upload,
  Car,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Tag,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { UserRole } from '@/types/index';
import { cn } from '@utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['all'] },
  { name: 'Marcas', href: '/marcas', icon: Tag, roles: ['all'] },
  { name: 'Importar', href: '/import', icon: Upload, roles: ['all'] },
  { name: 'Modelos', href: '/modelos', icon: Car, roles: ['all'] },
  { name: 'Cargar Datos Modelos', href: '/cargar-datos', icon: Settings, roles: ['all'] },
  { name: 'Revisar Vehiculos', href: '/revisar-vehiculos', icon: CheckCircle2, roles: ['all'] },
  { name: 'Precios', href: '/precios', icon: DollarSign, roles: ['all'] },
  { name: 'Ventas', href: '/ventas', icon: BarChart3, roles: ['all'] },
  { name: 'Empadronamientos', href: '/empadronamientos', icon: FileText, roles: ['all'] },
  { name: 'Exportar Datos', href: '/export', icon: Download, roles: ['all'] },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['all'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const canAccessRoute = (roles: string[]) => {
    if (roles.includes('all')) return true;
    return user && roles.includes(user.rol);
  };

  const filteredNavigation = navigation.filter((item) => canAccessRoute(item.roles));

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar móvil */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">Autodata</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="h-10 w-10 border rounded-full bg-primary flex flex-row items-center justify-center text-primary-foreground font-semibold">
                {user?.nombre?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.nombre}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <button
                onClick={toggleDarkMode}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
              <Link
                to="/settings"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configuración
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Autodata'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
