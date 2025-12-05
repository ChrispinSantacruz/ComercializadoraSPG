import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import NotificationCenter from '../../components/profile/NotificationCenter';

const ProfilePage: React.FC = () => {
  const { user, updateUser, checkAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || '',
      });
    }
  }, [user]);

  if (!user) {
    return <LoadingSpinner />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Contraseña cambiada correctamente');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar los 2MB');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await authService.uploadAvatar(file);
      updateUser(updatedUser);
      setSuccess('Foto de perfil actualizada correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la foto de perfil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setUploadingBanner(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await authService.uploadBanner(file);
      updateUser(updatedUser);
      setSuccess('Banner actualizado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    setError(null);
    setSuccess(null);
    
    try {
      await checkAuth();
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setRefreshing(false);
    }
  };

  const QuickActions = () => {
    if (user.rol === 'comerciante') {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/merchant/products"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🛍️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Gestionar Productos</h4>
                  <p className="text-sm text-gray-600">Agregar, editar y administrar tus productos</p>
                </div>
              </div>
            </Link>

            <Link
              to="/merchant/orders"
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">📦</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-600">Ver Pedidos</h4>
                  <p className="text-sm text-gray-600">Administrar pedidos de tus productos</p>
                </div>
              </div>
            </Link>

            <Link
              to="/merchant/analytics"
              className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <span className="text-white text-xl">📈</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Análisis</h4>
                  <p className="text-sm text-gray-600">Ver estadísticas y reportes de ventas</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      );
    }

    if (user.rol === 'cliente') {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/orders"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white text-xl">📦</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Mis Pedidos</h4>
                  <p className="text-sm text-gray-600">Ver el estado de tus compras</p>
                </div>
              </div>
            </Link>

            <Link
              to="/productos"
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🛒</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-600">Seguir Comprando</h4>
                  <p className="text-sm text-gray-600">Explorar más productos</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header del perfil con banner si es comerciante */}
        <div className="relative">
          {/* Banner para comerciantes */}
          {user.rol === 'comerciante' && (
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
              {user.banner ? (
                <img 
                  src={user.banner} 
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg">Sube un banner para tu negocio</p>
                </div>
              )}
              <div className="absolute bottom-4 right-4">
                <label className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2">
                  {uploadingBanner ? '⏳ Subiendo...' : '📸 Cambiar Banner'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
          
          {/* Header del perfil */}
          <div className={`${user.rol === 'comerciante' ? 'bg-white' : 'bg-gradient-to-r from-blue-600 to-blue-800'} px-6 py-8`}>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`${user.rol === 'comerciante' ? 'text-blue-600' : 'text-white'} text-2xl font-bold`}>
                      {user.nombre?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  {uploadingAvatar ? '⏳' : '📷'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className={`text-3xl font-bold ${user.rol === 'comerciante' ? 'text-gray-900' : 'text-white'} mb-2`}>
                      Mi Perfil
                    </h1>
                    <p className={user.rol === 'comerciante' ? 'text-gray-600' : 'text-blue-100'}>
                      {user.nombre || 'Usuario'} • {user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1) || 'Cliente'}
                    </p>
                    {user.verificado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Email verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                        Email pendiente de verificar
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleRefreshProfile}
                    disabled={refreshing}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      user.rol === 'comerciante' 
                        ? 'bg-white hover:bg-gray-50 text-gray-700' 
                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                    } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Actualizar perfil"
                  >
                    <svg 
                      className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mx-6 mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Información del perfil */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
            <div className="space-x-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Perfil
                </button>
              )}
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cambiar Contraseña
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 300 123 4567"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre completo</h3>
                <p className="text-gray-900">{user.nombre}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Teléfono</h3>
                <p className="text-gray-900">{user.telefono || 'No especificado'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Rol</h3>
                <p className="text-gray-900 capitalize">{user.rol}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de registro</h3>
                <p className="text-gray-900">
                  {new Date(user.fechaCreacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estado de verificación</h3>
                <p className="text-gray-900">
                  {user.verificado ? 'Verificado' : 'Pendiente de verificación'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cambio de contraseña */}
        {showPasswordChange && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <QuickActions />

      {/* Estadísticas diferenciadas por rol */}
      {user.estadisticas && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user.rol === 'comerciante' ? 'Resumen de Negocio' : 'Mi Actividad'}
          </h2>
          
          {user.rol === 'comerciante' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Productos Vendidos</h3>
                <p className="text-2xl font-bold text-blue-900">
                  {user.estadisticas.productosVendidos || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Ingresos Totales</h3>
                <p className="text-2xl font-bold text-green-900">
                  ${(user.estadisticas.ingresosTotales || 0).toLocaleString('es-CO')}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Pedidos Gestionados</h3>
                <p className="text-2xl font-bold text-purple-900">
                  {user.estadisticas.pedidosRealizados || 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Pedidos Realizados</h3>
                <p className="text-2xl font-bold text-blue-900">
                  {user.estadisticas.pedidosRealizados || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Total Gastado</h3>
                <p className="text-2xl font-bold text-green-900">
                  ${(user.estadisticas.totalGastado || 0).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Centro de Notificaciones */}
      <div className="mt-6">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default ProfilePage; 