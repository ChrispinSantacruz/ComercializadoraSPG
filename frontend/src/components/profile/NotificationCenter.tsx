import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Notification {
  _id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  estado: 'no_leida' | 'leida' | 'archivada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: string;
  datos?: {
    elementoId?: string;
    tipoElemento?: string;
    url?: string;
    accion?: string;
    datosExtra?: any;
  };
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      // Obtener token del authStore (disponible desde useAuthStore)
      const authStorage = localStorage.getItem('auth-storage');
      let token = null;
      
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          token = authData.state?.token;
        } catch (error) {
          console.error('❌ Error parseando auth-storage:', error);
        }
      }
      
      console.log('🔍 Cargando notificaciones...');
      console.log('🔍 API URL:', apiUrl);
      console.log('🔍 Token presente:', !!token);
      
      if (!token) {
        console.error('❌ No hay token de autenticación');
        console.log('💡 Usuario no autenticado, no se pueden cargar notificaciones');
        setLoading(false);
        return;
      }
      
      console.log('🔑 Token a enviar:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      const response = await fetch(`${apiUrl}/api/notifications/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Respuesta de notificaciones:', response.status, response.statusText);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notificaciones cargadas:', data);
        console.log('📊 Estructura de datos:', {
          exito: data.exito,
          mensaje: data.mensaje,
          datos: data.datos,
          notifications: data.notifications,
          unreadCount: data.unreadCount,
          total: data.total,
          success: data.success
        });
        
        // Manejar diferentes estructuras de respuesta
        let notifications = [];
        let unreadCount = 0;
        
        // Estructura del backend: { exito: true, datos: { notifications: [...], unreadCount: 6 } }
        if (data.datos && data.datos.notifications && Array.isArray(data.datos.notifications)) {
          notifications = data.datos.notifications;
          unreadCount = data.datos.unreadCount || 0;
        }
        // Estructura alternativa: { notifications: [...], unreadCount: 6 }
        else if (data.notifications && Array.isArray(data.notifications)) {
          notifications = data.notifications;
          unreadCount = data.unreadCount || 0;
        }
        // Estructura directa: [...]
        else if (Array.isArray(data)) {
          notifications = data;
          unreadCount = notifications.filter((n: any) => n.estado === 'no_leida').length;
        }
        // Estructura con data: { data: [...] }
        else if (data.data && Array.isArray(data.data)) {
          notifications = data.data;
          unreadCount = data.unreadCount || notifications.filter((n: any) => n.estado === 'no_leida').length;
        }
        // Fallback: buscar en cualquier propiedad que contenga array
        else {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            notifications = possibleArrays[0] as any[];
            unreadCount = notifications.filter((n: any) => n.estado === 'no_leida').length;
          }
        }
        
        console.log('📋 Notificaciones procesadas:', notifications.length);
        console.log('🔢 No leídas:', unreadCount);
        
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } else if (response.status === 401) {
        console.error('❌ Error 401: Token no válido o expirado');
        // Limpiar tokens inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        // Redirigir al login
        window.location.href = '/login';
      } else {
        console.error('❌ Error cargando notificaciones:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      // Obtener token del sistema de autenticación principal
      let token = null;
      const authStorage = localStorage.getItem('auth-storage');
      
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          token = authData.state?.token;
        } catch (error) {
          console.error('❌ Error parseando auth-storage:', error);
        }
      }
      
      // Fallback: buscar token directo
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      if (!token) {
        console.error('❌ No hay token para marcar como leída');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, estado: 'leida' }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('❌ Error marcando notificación como leída:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    const icons: { [key: string]: string } = {
      'nueva_venta': '💰',
      'pedido_confirmado': '✅',
      'pedido_enviado': '🚚',
      'pedido_entregado': '📦',
      'nueva_reseña': '⭐',
      'producto_aprobado': '✅',
      'producto_rechazado': '❌',
      'stock_bajo': '⚠️',
      'sistema': '🔔'
    };
    return icons[tipo] || '📢';
  };

  const getNotificationColor = (prioridad: string) => {
    const colors: { [key: string]: string } = {
      'urgente': 'border-red-500 bg-red-50',
      'alta': 'border-orange-500 bg-orange-50',
      'media': 'border-blue-500 bg-blue-50',
      'baja': 'border-gray-500 bg-gray-50'
    };
    return colors[prioridad] || 'border-gray-500 bg-gray-50';
  };

  const getStatusColor = (estado: string) => {
    return estado === 'no_leida' ? 'bg-blue-500' : 'bg-gray-400';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return notification.estado === 'no_leida';
    if (activeTab === 'archived') return notification.estado === 'archivada';
    return notification.estado !== 'archivada';
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={loadNotifications}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-6">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'unread', label: 'No leídas' },
            { key: 'archived', label: 'Archivadas' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500">
              {activeTab === 'all' && 'No tienes notificaciones'}
              {activeTab === 'unread' && 'No tienes notificaciones sin leer'}
              {activeTab === 'archived' && 'No tienes notificaciones archivadas'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  notification.estado === 'no_leida' ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(notification.estado)}`} />
                  
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 text-xl">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.titulo}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.fechaCreacion).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {/* Priority indicator */}
                      <div className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${getNotificationColor(notification.prioridad)}`}>
                        {notification.prioridad}
                      </div>
                    </div>
                    
                    {/* Action button if available */}
                    {notification.datos?.url && (
                      <div className="mt-3">
                        <a
                          href={notification.datos.url}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {notification.datos.accion || 'Ver detalles'}
                          <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 