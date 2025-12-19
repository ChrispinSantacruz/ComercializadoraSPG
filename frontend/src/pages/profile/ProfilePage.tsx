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
    // Campos de negocio para comerciantes
    nombreEmpresa: user?.nombreEmpresa || '',
    descripcionEmpresa: user?.descripcionEmpresa || '',
    categoriaEmpresa: user?.categoriaEmpresa || '',
    sitioWeb: user?.sitioWeb || '',
    redesSociales: {
      facebook: user?.redesSociales?.facebook || '',
      instagram: user?.redesSociales?.instagram || '',
      twitter: user?.redesSociales?.twitter || ''
    }
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
        // Campos de negocio para comerciantes
        nombreEmpresa: user.nombreEmpresa || '',
        descripcionEmpresa: user.descripcionEmpresa || '',
        categoriaEmpresa: user.categoriaEmpresa || '',
        sitioWeb: user.sitioWeb || '',
        redesSociales: {
          facebook: user.redesSociales?.facebook || '',
          instagram: user.redesSociales?.instagram || '',
          twitter: user.redesSociales?.twitter || ''
        }
      });
    }
  }, [user]);

  if (!user) {
    return <LoadingSpinner />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejar campos de redes sociales
    if (name.startsWith('redesSociales.')) {
      const socialField = name.split('.')[1];
      setFormData({
        ...formData,
        redesSociales: {
          ...formData.redesSociales,
          [socialField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones específicas para comerciantes
    if (user.rol === 'comerciante') {
      if (!formData.nombreEmpresa || !formData.descripcionEmpresa || !formData.categoriaEmpresa) {
        setError('Por favor completa todos los campos obligatorios del negocio');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📝 Enviando datos de actualización:', formData);
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
      // Campos de negocio para comerciantes
      nombreEmpresa: user?.nombreEmpresa || '',
      descripcionEmpresa: user?.descripcionEmpresa || '',
      categoriaEmpresa: user?.categoriaEmpresa || '',
      sitioWeb: user?.sitioWeb || '',
      redesSociales: {
        facebook: user?.redesSociales?.facebook || '',
        instagram: user?.redesSociales?.instagram || '',
        twitter: user?.redesSociales?.twitter || ''
      }
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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header del perfil con banner si es comerciante */}
        <div className="relative">
          {/* Banner para comerciantes */}
          {user.rol === 'comerciante' && (
            <div className="relative h-40 sm:h-52 md:h-56 lg:h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
              {user.banner ? (
                <img 
                  src={user.banner} 
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full px-4 sm:px-6">
                  <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg text-center font-medium">Sube un banner para tu negocio</p>
                </div>
              )}
              <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 right-3 sm:right-4 md:right-5">
                <label className="bg-white/90 hover:bg-white text-blue-600 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium">
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
          <div className={`${user.rol === 'comerciante' ? 'bg-white' : 'bg-gradient-to-r from-blue-600 to-blue-800'} px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 md:space-x-6 lg:space-x-8 space-y-4 sm:space-y-0">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100"></div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 sm:p-2.5 md:p-3 rounded-full cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl">
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
              
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 text-center sm:text-left">
                    {user.rol === 'comerciante' ? (
                      <>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                          {user.nombreEmpresa || 'Mi Negocio'}
                        </h1>
                        <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-2">
                          {user.descripcionEmpresa || 'Descripción del negocio'}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          {user.categoriaEmpresa && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.categoriaEmpresa}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">
                          Dirigido por: {user.nombre}
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                          Mi Perfil
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm md:text-base font-medium">
                          {user.nombre || 'Usuario'} • {user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1) || 'Cliente'}
                        </p>
                      </>
                    )}
                    {user.verificado ? (
                      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 mt-2 sm:mt-3">
                        ✓ Email verificado
                      </span>
                    ) : (
                      <div className="mt-2 sm:mt-3 space-y-2">
                        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                          ⚠ Email pendiente de verificar
                        </span>
                        <br />
                        <Link
                          to={`/verify-email?email=${user.email}`}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📧 Verificar Email
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleRefreshProfile}
                    disabled={refreshing}
                    className={`sm:ml-4 p-2 sm:p-2.5 md:p-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                      user.rol === 'comerciante' 
                        ? 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400' 
                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                    } ${refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    title="Actualizar perfil"
                  >
                    <svg 
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${refreshing ? 'animate-spin' : ''}`} 
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
          <div className="mx-3 sm:mx-4 md:mx-6 mt-4 sm:mt-5 md:mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-lg shadow-md">
            <p className="text-sm sm:text-base font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mx-3 sm:mx-4 md:mx-6 mt-4 sm:mt-5 md:mt-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-lg shadow-md">
            <p className="text-sm sm:text-base font-medium">{success}</p>
          </div>
        )}

        {/* Información del perfil */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Información Personal</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
                >
                  ✏️ Editar Perfil
                </button>
              )}
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
              >
                🔒 Cambiar Contraseña
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

                {/* Campos de negocio para comerciantes */}
                {user.rol === 'comerciante' && (
                  <>
                    <div className="md:col-span-2 border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        🏢 Información del Negocio
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Empresa *
                      </label>
                      <input
                        type="text"
                        name="nombreEmpresa"
                        value={formData.nombreEmpresa}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de tu empresa"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        name="categoriaEmpresa"
                        value={formData.categoriaEmpresa}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Alimentación">🍕 Alimentación</option>
                        <option value="Tecnología">💻 Tecnología</option>
                        <option value="Ropa">👔 Ropa y Moda</option>
                        <option value="Hogar">🏠 Hogar y Decoración</option>
                        <option value="Salud">💊 Salud y Bienestar</option>
                        <option value="Servicios">🛠️ Servicios</option>
                        <option value="Deportes">⚽ Deportes</option>
                        <option value="Libros">📚 Libros y Educación</option>
                        <option value="Artesanías">🎨 Artesanías</option>
                        <option value="Otro">📦 Otro</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción del Negocio *
                      </label>
                      <textarea
                        name="descripcionEmpresa"
                        value={formData.descripcionEmpresa}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe tu negocio y los productos que vendes..."
                        maxLength={500}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.descripcionEmpresa.length}/500 caracteres
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sitio Web
                      </label>
                      <input
                        type="url"
                        name="sitioWeb"
                        value={formData.sitioWeb}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.tuempresa.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Redes Sociales
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="redesSociales.facebook"
                          value={formData.redesSociales.facebook}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Facebook: @tuempresa"
                        />
                        <input
                          type="text"
                          name="redesSociales.instagram"
                          value={formData.redesSociales.instagram}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Instagram: @tuempresa"
                        />
                      </div>
                    </div>
                  </>
                )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Nombre completo</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium">{user.nombre}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Email</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium break-all">{user.email}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Teléfono</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium">{user.telefono || 'No especificado'}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Rol</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium capitalize">{user.rol}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Fecha de registro</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium">
                  {new Date(user.fechaCreacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 sm:mb-2 uppercase tracking-wide">Estado de verificación</h3>
                <p className="text-gray-900 text-sm sm:text-base font-medium">
                  {user.verificado ? 'Verificado' : 'Pendiente de verificación'}
                </p>
              </div>

              {/* Información del negocio para comerciantes */}
              {user.rol === 'comerciante' && (
                <>
                  <div className="md:col-span-2 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      🏢 Información del Negocio
                    </h3>
                  </div>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1 sm:mb-2 uppercase tracking-wide">Nombre de la Empresa</h3>
                    <p className="text-gray-900 text-sm sm:text-base font-medium">{user.nombreEmpresa || 'No especificado'}</p>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1 sm:mb-2 uppercase tracking-wide">Categoría</h3>
                    <p className="text-gray-900 text-sm sm:text-base font-medium">{user.categoriaEmpresa || 'No especificado'}</p>
                  </div>

                  <div className="md:col-span-2 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1 sm:mb-2 uppercase tracking-wide">Descripción del Negocio</h3>
                    <p className="text-gray-900 text-sm sm:text-base">{user.descripcionEmpresa || 'No especificado'}</p>
                  </div>

                  {user.sitioWeb && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                      <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1 sm:mb-2 uppercase tracking-wide">Sitio Web</h3>
                      <a href={user.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm sm:text-base hover:underline">
                        {user.sitioWeb}
                      </a>
                    </div>
                  )}

                  {(user.redesSociales?.facebook || user.redesSociales?.instagram) && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                      <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Redes Sociales</h3>
                      <div className="space-y-1">
                        {user.redesSociales?.facebook && (
                          <p className="text-gray-900 text-sm">Facebook: {user.redesSociales.facebook}</p>
                        )}
                        {user.redesSociales?.instagram && (
                          <p className="text-gray-900 text-sm">Instagram: {user.redesSociales.instagram}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
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