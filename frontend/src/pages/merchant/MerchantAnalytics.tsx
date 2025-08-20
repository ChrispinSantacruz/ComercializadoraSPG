import React, { useState, useEffect, useCallback } from 'react';
import analyticsService, { AnalyticsData } from '../../services/analyticsService';
import orderService from '../../services/orderService';
import { productService } from '../../services/productService';
import reviewService from '../../services/reviewService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getFirstImageUrl } from '../../utils/imageUtils';

const MerchantAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Cargando analytics del comerciante...');

      // Usar el servicio de analytics del comerciante
      const analyticsData = await analyticsService.getMerchantAnalytics(selectedPeriod);
      console.log('✅ Analytics cargados exitosamente:', analyticsData);
      setAnalytics(analyticsData);

    } catch (error: any) {
      console.error('❌ Error cargando analytics:', error);
      
      // Fallback a datos básicos si todo falla
      const fallbackData = {
        totalIngresos: 0,
        ingresosDelMes: 0,
        ingresosMesAnterior: 0,
        porcentajeCambio: 0,
        ventasDelMes: 0,
        ventasTotales: 0,
        totalProductos: 0,
        productosActivos: 0,
        productosAgotados: 0,
        productosMasVendidos: [],
        pedidosTotales: 0,
        pedidosDelMes: 0,
        pedidosEnTransito: 0,
        pedidosEntregados: 0,
        tasaConfirmacion: 0,
        clientesUnicos: 0,
        totalReseñas: 0,
        calificacionPromedio: 0,
        distribucionCalificaciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reseñasRecientes: [],
        ventasPorDia: [],
        pedidosPorEstado: []
      };
      
      console.log('🔄 Usando datos de fallback básicos:', fallbackData);
      setAnalytics(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Agregar intervalo de actualización automática
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
    }, 60000); // Actualizar cada 60 segundos

    return () => clearInterval(interval);
  }, [loadAnalytics]);

  // Componente de métrica
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
    color: string;
  }> = ({ title, value, change, changeType = 'neutral', icon, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  // Componente de gráfica simple
  const SimpleChart: React.FC<{
    title: string;
    data: Array<{ fecha: string; ventas: number; ingresos: number }>;
  }> = ({ title, data }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.fecha}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-600">{item.ventas} ventas</span>
              <span className="text-sm font-medium text-green-600">
                ${item.ingresos.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Comerciante</h2>
          <p className="text-gray-600">Gestiona tu negocio y analiza tus ventas</p>
          <p className="text-red-500 mt-4">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Comerciante</h1>
        <p className="text-gray-600">Gestiona tu negocio y analiza tus ventas</p>
        
        {/* Selector de período */}
        <div className="mt-4 flex space-x-2">
          {[
            { value: '7d', label: '7 días' },
            { value: '30d', label: '30 días' },
            { value: '90d', label: '90 días' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Ingresos del Mes"
          value={`$${analytics.ingresosDelMes.toLocaleString('es-CO')}`}
          change={`↗️${analytics.porcentajeCambio.toFixed(1)}% vs mes anterior`}
          changeType={analytics.porcentajeCambio >= 0 ? 'positive' : 'negative'}
          icon="💰"
          color="border-green-500"
        />
        
        <MetricCard
          title="Pedidos en Tránsito"
          value={analytics.pedidosEnTransito}
          change="Requieren atención"
          icon="🚚"
          color="border-orange-500"
        />
        
        <MetricCard
          title="Productos Agotados"
          value={analytics.productosAgotados}
          change="Necesitan restock"
          icon="📦"
          color="border-red-500"
        />
        
        <MetricCard
          title="Tasa Confirmación"
          value={`${analytics.tasaConfirmacion.toFixed(1)}%`}
          change="Entregas confirmadas"
          icon="✅"
          color="border-blue-500"
        />
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Clientes Únicos"
          value={analytics.clientesUnicos}
          change="Este mes"
          icon="👥"
          color="border-purple-500"
        />
        
        <MetricCard
          title="Total Productos"
          value={analytics.totalProductos}
          change="En tu catálogo"
          icon="🛍️"
          color="border-indigo-500"
        />
        
        <MetricCard
          title="Pedidos del Mes"
          value={analytics.pedidosDelMes}
          change="Ventas del Mes"
          icon="📋"
          color="border-teal-500"
        />
        
        <MetricCard
          title="Reseñas Totales"
          value={analytics.totalReseñas}
          change={`⭐ ${analytics.calificacionPromedio.toFixed(1)}`}
          icon="⭐"
          color="border-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de ventas por día */}
        <SimpleChart
          title="Ventas por Día"
          data={analytics.ventasPorDia}
        />

        {/* Estado de entregas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Entregas</h3>
          {analytics.pedidosPorEstado.length > 0 ? (
            <div className="space-y-3">
              {analytics.pedidosPorEstado.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.estado}</span>
                  <span className="text-sm font-medium text-blue-600">{item.cantidad}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de entregas</p>
          )}
        </div>
      </div>

      {/* Reseñas */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reseñas</h3>
        
        {/* Estadísticas de reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Total reseñas</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalReseñas}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Promedio</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.calificacionPromedio.toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Distribución de calificaciones */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Distribución de Calificaciones</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-8">{star} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ 
                      width: `${analytics.totalReseñas > 0 ? (analytics.distribucionCalificaciones[star] / analytics.totalReseñas) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {analytics.distribucionCalificaciones[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reseñas recientes */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Reseñas Recientes</h4>
          {analytics.reseñasRecientes.length > 0 ? (
            <div className="space-y-4">
              {analytics.reseñasRecientes.map((reseña, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">
                        {'⭐'.repeat(reseña.calificacion)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(reseña.fechaCreacion).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{reseña.comentario}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reseña.usuario} - {reseña.producto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay reseñas recientes</p>
          )}
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Productos Más Vendidos</h3>
        <p className="text-sm text-gray-600 mb-4">Últimos 30 días</p>
        
        {analytics.productosMasVendidos.length > 0 ? (
          <div className="space-y-4">
            {analytics.productosMasVendidos.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <img
                    src={getFirstImageUrl(item.producto?.imagenes)}
                    alt={item.producto?.nombre}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.producto?.nombre}</h4>
                  <p className="text-sm text-gray-600">
                    {item.cantidadVendida} vendidos • ${item.ingresosTotales.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-500">No hay ventas registradas aún</p>
            <p className="text-sm text-gray-400">Tus productos más vendidos aparecerán aquí</p>
          </div>
        )}
      </div>

      {/* Resumen de ventas */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.pedidosTotales}</p>
            <p className="text-sm text-gray-600">Total Pedidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">${analytics.totalIngresos.toLocaleString('es-CO')}</p>
            <p className="text-sm text-gray-600">Ingresos Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              ${analytics.ventasTotales > 0 ? (analytics.totalIngresos / analytics.ventasTotales).toFixed(0) : 0}
            </p>
            <p className="text-sm text-gray-600">Promedio Diario</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAnalytics; 