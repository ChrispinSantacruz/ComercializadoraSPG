import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Enfocar el input cuando se abre
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <>
      {/* Barra superior negra */}
      <div className="bg-black text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            {/* Lado izquierdo */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h.5a1.5 1.5 0 010 3h-1.5v7a1 1 0 01-1 1H5a1 1 0 01-1-1V9H2.5a1.5 1.5 0 010-3H3V4z" />
                </svg>
                <span className="text-green-400 font-medium">Envío gratis</span>
                <span className="text-gray-300">{'>'}</span>
                <span className="text-gray-300">Especial para ti</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-400 font-medium">Devoluciones gratis</span>
                <span className="text-gray-300">para CADA pedido</span>
              </div>
            </div>

            {/* Lado derecho */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-300">Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

  {/* Barra principal azul */}
  <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Lado izquierdo - Logo y navegación */}
            <div className="flex items-center space-x-8">
              {/* Logo SurAndino */}
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/images/Logo.png" 
                  alt="SurAndino Logo" 
                  className="h-12 w-12 rounded-lg shadow-lg object-contain"
                />
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold text-white">SurAndino</h1>
                  <p className="text-orange-200 text-sm">Tu plataforma de confianza</p>
                </div>
              </Link>

              {/* Enlaces de navegación */}
              <nav className="hidden lg:flex items-center space-x-6">
                <Link 
                  to="/" 
                  className="text-white hover:text-orange-200 font-medium transition duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Inicio</span>
                </Link>
                
                <Link 
                  to="/productos" 
                  className="text-white hover:text-orange-200 font-medium transition duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Productos</span>
                </Link>

                {/* Dropdown de Categorías */}
                <div className="relative">
                  <button 
                    onClick={() => setShowCategories(!showCategories)}
                    className="text-white hover:text-orange-200 font-medium transition duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Categorías</span>
                    <svg className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showCategories && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                      <div className="py-2">
                        <Link to="/productos?categoria=electronica" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          🖥️ Electrónica
                        </Link>
                        <Link to="/productos?categoria=ropa" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          👕 Ropa y Accesorios
                        </Link>
                        <Link to="/productos?categoria=hogar" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          🏠 Hogar y Jardín
                        </Link>
                        <Link to="/productos?categoria=deportes" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          ⚽ Deportes
                        </Link>
                        <Link to="/productos?categoria=belleza" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          💄 Belleza y Salud
                        </Link>
                        <Link to="/productos?categoria=juguetes" className="block px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200">
                          🧸 Juguetes y Juegos
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  to="/sobre-nosotros" 
                  className="text-white hover:text-orange-200 font-medium transition duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Sobre Nosotros</span>
                </Link>
              </nav>
            </div>

            {/* Centro - Botón de búsqueda */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={toggleSearch}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition duration-200 border border-white/20 hover:border-white/40"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Lado derecho - Acciones del usuario */}
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* Pedidos y cuenta */}
                  <Link 
                    to="/profile" 
                    className="text-white hover:text-orange-200 transition duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden md:block text-sm">Mi Cuenta</span>
                  </Link>

                  {/* Carrito */}
                  <Link 
                    to="/carrito" 
                    className="text-white hover:text-orange-200 transition duration-300 relative"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    {/* Indicador de cantidad del carrito */}
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getItemCount()}
                    </span>
                  </Link>

                  {/* Cerrar sesión */}
                  <button 
                    onClick={handleLogout}
                    className="text-white hover:text-orange-200 transition duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden md:block text-sm">Salir</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Iniciar sesión */}
                  <Link 
                    to="/login" 
                    className="text-white hover:text-orange-200 transition duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden md:block text-sm">Iniciar Sesión</span>
                  </Link>

                  {/* Registrarse */}
                  <Link 
                    to="/register" 
                    className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-600 transition duration-300 text-sm"
                  >
                    Registrarse
                  </Link>
                </>
              )}

              {/* Botón de menú móvil */}
              <div className="lg:hidden">
                <button className="text-white hover:text-orange-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de búsqueda desplegable */}
      {showSearch && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="¿Qué estás buscando? Encuentra productos increíbles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 pr-20 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-primary-600 text-lg shadow-soft border-0"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition duration-200 font-medium shadow-medium"
                >
                  Buscar
                </button>
              </div>
              
              {/* Sugerencias de búsqueda */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-white/80 text-sm">Búsquedas populares:</span>
                {['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Belleza'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      navigate(`/productos?search=${encodeURIComponent(suggestion)}`);
                      setShowSearch(false);
                    }}
                    className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm transition duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
