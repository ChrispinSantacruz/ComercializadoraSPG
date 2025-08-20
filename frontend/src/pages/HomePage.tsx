import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a Comercializadora SPG
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Tu plataforma de confianza para compras y ventas en línea
            </p>
            
            {/* Botones principales */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/productos" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg"
              >
                🛍️ Ver Catálogo
              </Link>
              
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/register" 
                    className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-300 shadow-lg"
                  >
                    🚀 Crear Cuenta
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition duration-300"
                  >
                    🔑 Iniciar Sesión
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition duration-300 shadow-lg"
                >
                  📊 Mi Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Productos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Comerciantes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">25,000+</div>
              <div className="text-gray-600">Clientes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">50,000+</div>
              <div className="text-gray-600">Pedidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Comercializadora SPG?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia para compradores y vendedores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition duration-300">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🛒</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Compras Seguras</h3>
              <p className="text-gray-600 mb-6">
                Sistema de pagos seguro con PSE, Nequi y tarjetas. Protección total al comprador.
              </p>
              <Link 
                to="/productos" 
                className="text-blue-600 font-semibold hover:text-blue-800 transition duration-300"
              >
                Explorar productos →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition duration-300">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚚</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Envío Rápido</h3>
              <p className="text-gray-600 mb-6">
                Entrega rápida en toda Colombia con seguimiento en tiempo real de tu pedido.
              </p>
              <Link 
                to="/productos" 
                className="text-green-600 font-semibold hover:text-green-800 transition duration-300"
              >
                Ver opciones de envío →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition duration-300">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏪</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Vende Fácil</h3>
              <p className="text-gray-600 mb-6">
                Plataforma intuitiva para comerciantes con herramientas de análisis y gestión.
              </p>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="text-purple-600 font-semibold hover:text-purple-800 transition duration-300"
                >
                  Registrarse como comerciante →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Merchants Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Eres comerciante?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Únete a nuestra plataforma y haz crecer tu negocio. Accede a miles de clientes 
                potenciales y gestiona tu tienda con nuestras herramientas profesionales.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Comisiones competitivas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Dashboard completo de analíticas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Gestión fácil de inventario</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">Soporte 24/7</span>
                </div>
              </div>

              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 inline-block"
                >
                  🏪 Registrarse como Comerciante
                </Link>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Haz crecer tu negocio
                </h3>
                <p className="text-gray-600">
                  Con nuestras herramientas de marketing y análisis, podrás maximizar 
                  tus ventas y conocer mejor a tus clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Acceso Rápido
            </h2>
            <p className="text-xl text-gray-600">
              Ve directamente a lo que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/productos" 
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🛍️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Catálogo</h3>
              <p className="text-sm text-gray-600">Ver todos los productos</p>
            </Link>

            {isAuthenticated ? (
              <Link 
                to="/carrito" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🛒</div>
                <h3 className="font-semibold text-gray-900 mb-2">Mi Carrito</h3>
                <p className="text-sm text-gray-600">Ver productos guardados</p>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🔑</div>
                <h3 className="font-semibold text-gray-900 mb-2">Iniciar Sesión</h3>
                <p className="text-sm text-gray-600">Accede a tu cuenta</p>
              </Link>
            )}

            {isAuthenticated ? (
              <Link 
                to="/orders" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">📦</div>
                <h3 className="font-semibold text-gray-900 mb-2">Mis Pedidos</h3>
                <p className="text-sm text-gray-600">Historial de compras</p>
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">👤</div>
                <h3 className="font-semibold text-gray-900 mb-2">Registrarse</h3>
                <p className="text-sm text-gray-600">Crear cuenta nueva</p>
              </Link>
            )}

            {isAuthenticated && user?.rol === 'comerciante' ? (
              <Link 
                to="/merchant" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🏪</div>
                <h3 className="font-semibold text-gray-900 mb-2">Mi Tienda</h3>
                <p className="text-sm text-gray-600">Panel de comerciante</p>
              </Link>
            ) : (
              <Link 
                to="/productos" 
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Buscar</h3>
                <p className="text-sm text-gray-600">Encuentra productos</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de usuarios que ya confían en nosotros
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg"
                >
                  🚀 Crear Cuenta Gratis
                </Link>
                <Link
                  to="/productos"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition duration-300"
                >
                  🛍️ Explorar Catálogo
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/productos"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg"
                >
                  🛍️ Ir de Compras
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition duration-300"
                >
                  📊 Mi Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;