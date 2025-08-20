import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNotifications } from '../../components/ui/NotificationContainer';
import { getImageUrl, handleImageError, getFirstImageUrl } from '../../utils/imageUtils';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'merchant'>('description');

  const loadProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);
      
      // Si la categoría viene como ID, cargar la información de la categoría
      if (productData.categoria && typeof productData.categoria === 'string') {
        setLoadingCategory(true);
        try {
          const categoryData = await categoryService.getCategoryById(productData.categoria);
          setCategory(categoryData);
        } catch (err) {
          console.warn('No se pudo cargar la información de la categoría:', err);
        } finally {
          setLoadingCategory(false);
        }
      } else if (productData.categoria && typeof productData.categoria === 'object') {
        setCategory(productData.categoria as Category);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando producto');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await cartService.addProduct(product._id, quantity);
      showSuccess(
        '¡Producto agregado!',
        `${product.nombre} se agregó al carrito (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'})`,
        {
          label: 'Ver carrito',
          onClick: () => navigate('/carrito')
        }
      );
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Error agregando al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await cartService.addProduct(product._id, quantity);
      showSuccess('¡Producto añadido!', 'Procediendo al checkout...');
      setTimeout(() => navigate('/checkout'), 1000);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Error procesando compra');
    } finally {
      setAddingToCart(false);
    }
  };

  const getCategoryName = () => {
    if (category) {
      return category.nombre;
    }
    if (!product?.categoria) return 'Sin categoría';
    return typeof product.categoria === 'string' 
      ? (loadingCategory ? 'Cargando categoría...' : 'Categoría') 
      : product.categoria.nombre || 'Sin categoría';
  };

  const getCategoryForBreadcrumb = () => {
    if (category) {
      return category.nombre;
    }
    if (!product?.categoria) return 'Sin categoría';
    return typeof product.categoria === 'string' 
      ? 'Categoría' // Para el breadcrumb, usar texto genérico si no se puede cargar
      : product.categoria.nombre || 'Sin categoría';
  };

  const getMerchantName = () => {
    if (!product?.comerciante) return 'Comerciante';
    return typeof product.comerciante === 'string' 
      ? 'Comerciante' // Si es un ID, mostrar texto genérico
      : product.comerciante.nombre || 'Comerciante';
  };

  const getProductImages = () => {
    if (!product?.imagenes || product.imagenes.length === 0) {
      return [{ url: getImageUrl(null), alt: product?.nombre || 'Producto' }];
    }
    
    return product.imagenes.map((img: any) => ({
      url: getImageUrl(typeof img === 'string' ? img : img.url),
      alt: typeof img === 'object' && img.alt ? img.alt : product.nombre
    }));
  };

  if (loading) return <LoadingSpinner />;

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error: {error || 'Producto no encontrado'}</p>
          <button
            onClick={() => navigate('/productos')}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <button onClick={() => navigate('/productos')} className="hover:text-blue-600">
            Productos
          </button>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">{getCategoryForBreadcrumb()}</span>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">{product.nombre}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imágenes */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.alt}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nombre}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Vendido por: <span className="font-medium">{getMerchantName()}</span> • 
              Categoría: <span className="font-medium">{getCategoryName()}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <p className="text-4xl font-bold text-green-600">
              ${product.precio?.toLocaleString('es-CO') || '0'}
            </p>
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">En stock ({product.stock} disponibles)</span>
            ) : (
              <span className="text-red-600 font-medium">Agotado</span>
            )}
          </div>

          {/* Estadísticas de reseñas */}
          {product.estadisticasReseñas && product.estadisticasReseñas.totalReseñas > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl text-yellow-400 mr-2">⭐</span>
                <span className="text-lg font-bold text-gray-900">
                  {product.estadisticasReseñas.promedioCalificacion.toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                ({product.estadisticasReseñas.totalReseñas} reseñas)
              </div>
            </div>
          )}

          {/* Controles de compra */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {addingToCart ? 'Agregando...' : 'Agregar al Carrito'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {addingToCart ? 'Procesando...' : 'Comprar Ahora'}
                </button>
              </div>
            </div>
          )}

          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Este producto está agotado</p>
              <p className="text-red-600 text-sm mt-1">
                Contacta al vendedor para más información sobre disponibilidad
              </p>
            </div>
          )}

          {/* Tabs de información */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Descripción
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reseñas ({product.estadisticasReseñas?.totalReseñas || 0})
              </button>
              <button
                onClick={() => setActiveTab('merchant')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'merchant'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vendedor
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                    <p className="text-gray-700 leading-relaxed">{product.descripcion}</p>
                  </div>

                  {/* Especificaciones */}
                  {product.especificaciones && Array.isArray(product.especificaciones) && product.especificaciones.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Especificaciones</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {product.especificaciones.map((spec, index) => (
                          <div key={index} className="flex justify-between border-b border-gray-100 py-1">
                            <span className="text-gray-600 capitalize">{spec.nombre}:</span>
                            <span className="font-medium">{spec.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {product.estadisticasReseñas && product.estadisticasReseñas.totalReseñas > 0 ? (
                    <>
                      {/* Estadísticas de reseñas */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Calificación promedio</p>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-gray-900 mr-2">
                                {product.estadisticasReseñas.promedioCalificacion.toFixed(1)}
                              </span>
                              <span className="text-yellow-400 text-xl">⭐</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {product.estadisticasReseñas.totalReseñas} reseñas
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Distribución</p>
                            {[5, 4, 3, 2, 1].map(star => (
                              <div key={star} className="flex items-center text-xs mb-1">
                                <span className="w-3">{star}</span>
                                <span className="text-yellow-400 mx-1">⭐</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded mx-2">
                                  <div 
                                    className="h-2 bg-yellow-400 rounded"
                                    style={{
                                      width: `${((product.estadisticasReseñas?.distribucionCalificaciones[star] || 0) / (product.estadisticasReseñas?.totalReseñas || 1)) * 100}%`
                                    }}
                                  />
                                </div>
                                <span className="w-6 text-right">{product.estadisticasReseñas?.distribucionCalificaciones[star] || 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lista de reseñas */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Reseñas recientes</h3>
                        <div className="space-y-4">
                          {product.reseñas?.map((review: any, index: number) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400 text-sm">
                                    {'⭐'.repeat(review.calificacion)}
                                  </div>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {new Date(review.fechaCreacion).toLocaleDateString('es-CO')}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {review.usuario?.nombre || 'Usuario anónimo'}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{review.comentario}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">⭐</div>
                      <p className="text-gray-500">No hay reseñas aún</p>
                      <p className="text-sm text-gray-400">Sé el primero en dejar una reseña</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'merchant' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Información del Vendedor</h3>
                    {typeof product.comerciante === 'object' && product.comerciante ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-medium">{product.comerciante.nombre}</p>
                        </div>
                        {product.comerciante.email && (
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{product.comerciante.email}</p>
                          </div>
                        )}
                        {product.comerciante.telefono && (
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium">{product.comerciante.telefono}</p>
                          </div>
                        )}
                        {product.comerciante.direccion && (
                          <div>
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="font-medium">
                              {typeof product.comerciante.direccion === 'string' 
                                ? product.comerciante.direccion 
                                : `${product.comerciante.direccion.calle || ''} ${product.comerciante.direccion.ciudad || ''} ${product.comerciante.direccion.departamento || ''}`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Información del vendedor no disponible</p>
                    )}
                  </div>

                  {/* Estadísticas de ventas del producto */}
                  {product.estadisticasVentas && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Estadísticas del Producto</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total vendido</p>
                          <p className="text-xl font-bold text-blue-600">
                            {product.estadisticasVentas.totalVendido} unidades
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ingresos generados</p>
                          <p className="text-xl font-bold text-green-600">
                            ${product.estadisticasVentas.totalIngresos.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {product.productosRelacionados && product.productosRelacionados.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.productosRelacionados.map((relatedProduct: any) => (
              <div key={relatedProduct._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200">
                  <img
                    src={getFirstImageUrl(relatedProduct.imagenes)}
                    alt={relatedProduct.nombre}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedProduct.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Vendido por {relatedProduct.comerciante?.nombre || 'Comerciante'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${relatedProduct.precio?.toLocaleString('es-CO')}
                    </span>
                    <button
                      onClick={() => navigate(`/productos/${relatedProduct._id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage; 