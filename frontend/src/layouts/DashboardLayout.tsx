import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import Footer from '../components/ui/Footer';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      logout();
      navigate('/');
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Inicio', href: '/', icon: '🏠' },
      { name: 'Mi Perfil', href: '/profile', icon: '👤' },
      { name: 'Mis Pedidos', href: '/orders', icon: '📦' },
    ];

    if (user?.rol === 'comerciante') {
      return [
        ...baseItems,
        { name: 'Mi Dashboard', href: '/merchant', icon: '📊' },
        { name: 'Mis Productos', href: '/merchant/products', icon: '🛍️' },
        { name: 'Análisis', href: '/merchant/analytics', icon: '📈' },
      ];
    }

    // Cliente
    return [
      ...baseItems,
      { name: 'Favoritos', href: '/favorites', icon: '❤️' },
      { name: 'Direcciones', href: '/addresses', icon: '📍' },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del dashboard */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/Logo.png" 
                alt="AndinoExpress Logo" 
                className="h-8 w-8 rounded-lg object-contain mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">
                AndinoExpress
              </h1>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {user?.nombre}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                {user?.rol}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen border-r border-gray-200">
          <nav className="mt-5 px-3">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout; 