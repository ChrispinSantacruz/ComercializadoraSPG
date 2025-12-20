import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SelectRolePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = location.state || {};
  const [selectedRol, setSelectedRol] = useState<'cliente' | 'comerciante' | null>(null);

  if (!usuario) {
    navigate('/login');
    return null;
  }

  const handleContinue = () => {
    if (!selectedRol) return;

    if (selectedRol === 'comerciante') {
      navigate('/complete-merchant-profile', { state: { usuario, rol: selectedRol } });
    } else {
      // Cliente - enviar directamente
      submitRol(selectedRol);
    }
  };

  const submitRol = async (rol: string) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/auth/seleccionar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: usuario._id,
          rol
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        throw new Error(data.mensaje || 'Error al seleccionar rol');
      }

      // Si es cliente, guardar token y redirigir
      if (rol === 'cliente' && data.datos.token) {
        const { useAuthStore } = await import('../../stores/authStore');
        useAuthStore.getState().setToken(data.datos.token);
        useAuthStore.getState().setUser(data.datos.usuario);
        navigate('/');
      }

    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al seleccionar rol: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d8e76]/10 via-white to-[#1c3a35]/5 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d8e76] text-white rounded-full mb-4">
            {usuario.avatar ? (
              <img src={usuario.avatar} alt={usuario.nombre} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {usuario.nombre}!
          </h1>
          <p className="text-gray-600">
            Para continuar, selecciona cómo deseas usar AndinoExpress
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Opción Cliente */}
          <button
            onClick={() => setSelectedRol('cliente')}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedRol === 'cliente'
                ? 'border-[#0d8e76] bg-[#0d8e76]/5 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-[#0d8e76] hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0d8e76]/10 text-[#0d8e76]">
                <span className="text-3xl">🛍️</span>
              </div>
              {selectedRol === 'cliente' && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0d8e76] text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Soy Cliente</h3>
            <p className="text-gray-600 mb-4">
              Quiero comprar productos de comerciantes locales
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Acceso inmediato
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Comprar productos
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Seguimiento de pedidos
              </li>
            </ul>
          </button>

          {/* Opción Comerciante */}
          <button
            onClick={() => setSelectedRol('comerciante')}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedRol === 'comerciante'
                ? 'border-green-600 bg-green-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600">
                <span className="text-3xl">🏪</span>
              </div>
              {selectedRol === 'comerciante' && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Soy Comerciante</h3>
            <p className="text-gray-600 mb-4">
              Quiero vender mis productos en la plataforma
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Vender productos
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Dashboard de ventas
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Gestión de inventario
              </li>
            </ul>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRol}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d8e76] to-[#1c3a35] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#0b7a64] hover:to-[#17312d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SelectRolePage;
