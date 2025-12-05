import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import categoryService from '../services/categoryService';
import { cartService } from '../services/cartService';
import { getFirstImageUrl, handleImageError } from '../utils/imageUtils';
import { useNotifications } from '../components/ui/NotificationContainer';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NewHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  
  // Función para asignar iconos a categorías
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('tecnolog') || name.includes('electr') || name.includes('comput')) return '💻';
    if (name.includes('ropa') || name.includes('vest') || name.includes('moda')) return '👕';
    if (name.includes('hogar') || name.includes('casa') || name.includes('decorac')) return '🏠';
    if (name.includes('deporte') || name.includes('ejerc') || name.includes('fit')) return '⚽';
    if (name.includes('salud') || name.includes('belle') || name.includes('cosm')) return '💄';
    if (name.includes('libro') || name.includes('educ') || name.includes('estud')) return '📚';
    if (name.includes('auto') || name.includes('vehíc') || name.includes('moto')) return '🚗';
    if (name.includes('cocina') || name.includes('aliment') || name.includes('comida')) return '🍳';
    if (name.includes('juguet') || name.includes('niñ') || name.includes('bebé')) return '🧸';
    if (name.includes('música') || name.includes('instru') || name.includes('audio')) return '🎵';
    return '📦'; // Icono por defecto
  };
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [cheapProducts, setCheapProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Cargar productos paralelo
      const [
        featuredResponse,
        newResponse,
        cheapResponse,
        categoriesResponse
      ] = await Promise.all([
        productService.getProducts({ limit: 6, estado: 'aprobado' }),
        productService.getProducts({ limit: 6, ordenar: 'fechaCreacion' }),
        productService.getProducts({ limit: 6, ordenar: 'precio' }),
        categoryService.getActiveCategories()
      ]);

      setFeaturedProducts(Array.isArray(featuredResponse) ? featuredResponse : featuredResponse.datos || []);
      setNewProducts(Array.isArray(newResponse) ? newResponse : newResponse.datos || []);
      setCheapProducts(Array.isArray(cheapResponse) ? cheapResponse : cheapResponse.datos || []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      
    } catch (error) {
      console.error('Error cargando datos del home:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await cartService.addProduct(product._id, 1);
      showSuccess('¡Agregado al carrito!', `${product.nombre} se agregó correctamente`);
    } catch (error) {
      showError('Error', 'No se pudo agregar el producto al carrito');
    }
  };

  const ProductCard: React.FC<{ product: Product; showOffer?: boolean }> = ({ 
    product, 
    showOffer = false 
  }) => (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={getFirstImageUrl(product.imagenes)}
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
        />
        {showOffer && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-full">
            🔥 OFERTA
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100"
          >
            🛒
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.nombre}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.descripcion}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-600">
              ${product.precio.toLocaleString('es-CO')}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs text-gray-500">{product.stock} disponibles</span>
            ) : (
              <span className="text-xs text-red-500">Agotado</span>
            )}
          </div>
          
          <button
            onClick={() => navigate(`/productos/${product._id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mejorado */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-80 h-80 bg-white opacity-5 rounded-full"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-4 h-4 bg-white opacity-20 rounded-full animate-pulse-glow"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-6 h-6 bg-white opacity-15 rounded-full animate-pulse-glow"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-3 h-3 bg-white opacity-25 rounded-full animate-pulse-glow"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
                ¡Descubre lo Mejor en SurAndino!
              </h1>
              <div className="text-3xl md:text-5xl mb-3">🛍️</div>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-10 text-gray-100 leading-relaxed max-w-4xl mx-auto">
              Productos de calidad, precios increíbles y envío a todo el país
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button
                onClick={() => navigate('/productos')}
                className="group bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 hero-glow hover-lift"
              >
                <span className="flex items-center justify-center">
                  🛒 Explorar Productos
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
              <button
                onClick={() => navigate('/sobre-nosotros')}
                className="group border-3 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 hover-lift"
              >
                <span className="flex items-center justify-center">
                  📖 Conoce Más
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            </div>
            
            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                <div className="text-2xl font-bold mb-1">10,000+</div>
                <div className="text-gray-200 text-sm">Productos</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-gray-200 text-sm">Comerciantes</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                <div className="text-2xl font-bold mb-1">25,000+</div>
                <div className="text-gray-200 text-sm">Clientes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Categories Section - Mejorado */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-xl">🏷️</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explora por Categorías</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Encuentra exactamente lo que necesitas en nuestras categorías especializadas. 
              Cada categoría está cuidadosamente curada para ofrecerte la mejor experiencia de compra.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {categories.slice(0, 6).map((category, index) => (
              <button
                key={category._id}
                onClick={() => navigate(`/productos?categoria=${category._id}`)}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 text-center transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon Container */}
                <div className="relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    {getCategoryIcon(category.nombre)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    {category.nombre}
                  </h3>
                  
                  {/* Animated Underline */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 mx-auto"></div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </button>
            ))}
          </div>
          
          {/* View All Categories Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/productos')}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-3 rounded-full font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center">
                Ver Todas las Categorías
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">⭐ Productos Destacados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Los favoritos de nuestros clientes, seleccionados especialmente para ti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {featuredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Productos Destacados Próximamente</h3>
              <p className="text-lg text-gray-500 max-w-md mx-auto">Estamos preparando una selección especial de productos para ti</p>
            </div>
          )}
        </div>
      </div>

      {/* New Products */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">🆕 Recién Llegados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Las últimas novedades y tendencias en nuestra tienda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {newProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Cheap Products */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">💰 Súper Ofertas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Los mejores precios que no te puedes perder - ¡Aprovecha ahora!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cheapProducts.map((product) => (
              <ProductCard key={product._id} product={product} showOffer />
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas? 🤔</h2>
          <p className="text-xl mb-8">Explora todo nuestro catálogo o contáctanos</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/productos')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🔍 Ver Todos los Productos
            </button>
            <button
              onClick={() => {/* Aquí activaremos el chat */}}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              💬 Contáctanos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHomePage; 