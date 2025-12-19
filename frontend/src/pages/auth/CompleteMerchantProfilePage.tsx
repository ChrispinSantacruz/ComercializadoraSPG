import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CompleteMerchantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, rol } = location.state || {};
  
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    descripcionEmpresa: '',
    categoriaEmpresa: '',
    sitioWeb: '',
    redesSociales: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    telefono: '',
    tipoDocumento: '',
    numeroDocumento: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!usuario || rol !== 'comerciante') {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreEmpresa || !formData.descripcionEmpresa || !formData.categoriaEmpresa || !formData.telefono) {
      setError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/seleccionar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: usuario._id,
          rol: 'comerciante',
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        throw new Error(data.mensaje || 'Error al completar perfil');
      }

      // Redirigir a verificación de código
      if (data.datos.requiereVerificacion) {
        navigate('/verify-code', { state: { userId: data.datos.userId, email: usuario.email } });
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al completar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
              <span className="text-3xl">💼</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Completa tu Perfil de Comerciante
            </h1>
            <p className="text-gray-600">
              Necesitamos algunos datos para verificar tu empresa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">🏢</span>
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Tienda El Buen Precio"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">📝</span>
                Descripción de la Empresa *
              </label>
              <textarea
                value={formData.descripcionEmpresa}
                onChange={(e) => setFormData({ ...formData, descripcionEmpresa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe brevemente tu negocio y los productos que vendes..."
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.descripcionEmpresa.length}/500 caracteres
              </p>
            </div>

            {/* Categoría de Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">🏷️</span>
                Categoría del Negocio *
              </label>
              <select
                value={formData.categoriaEmpresa}
                onChange={(e) => setFormData({ ...formData, categoriaEmpresa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">📱</span>
                Teléfono de Contacto *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: +57 300 123 4567"
                required
              />
            </div>

            {/* Sitio Web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">🌐</span>
                Sitio Web (Opcional)
              </label>
              <input
                type="url"
                value={formData.sitioWeb}
                onChange={(e) => setFormData({ ...formData, sitioWeb: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://www.tuempresa.com"
              />
            </div>

            {/* Redes Sociales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="inline mr-2">📱</span>
                Redes Sociales (Opcional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Facebook</label>
                  <input
                    type="text"
                    value={formData.redesSociales.facebook}
                    onChange={(e) => setFormData({ ...formData, redesSociales: { ...formData.redesSociales, facebook: e.target.value }})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="@tuempresa"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.redesSociales.instagram}
                    onChange={(e) => setFormData({ ...formData, redesSociales: { ...formData.redesSociales, instagram: e.target.value }})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="@tuempresa"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline mr-2">🆔</span>
                Tipo de Documento
              </label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecciona un tipo</option>
                <option value="NIT">NIT (Número de Identificación Tributaria)</option>
                <option value="RUT">RUT (Registro Único Tributario)</option>
                <option value="Cedula">Cédula de Ciudadanía</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            {/* Número de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento
              </label>
              <input
                type="text"
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ingresa tu número de documento"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Procesando...' : 'Continuar'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-sm text-gray-600 text-center">
              Al continuar, recibirás un código de verificación en <strong>{usuario.email}</strong>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteMerchantProfilePage;
