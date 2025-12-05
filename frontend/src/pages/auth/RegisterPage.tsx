import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'cliente' as 'cliente' | 'comerciante',
    nombreEmpresa: ''
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.nombre.trim()) {
      errors.push('El nombre es requerido');
    }

    if (!formData.email.trim()) {
      errors.push('El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('El email no es válido');
    }

    if (!formData.password) {
      errors.push('La contraseña es requerida');
    } else if (formData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    if (formData.rol === 'comerciante' && !formData.nombreEmpresa.trim()) {
      errors.push('El nombre de la empresa es requerido para comerciantes');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Enviando datos de registro:', formData);
      
      // Llamar al endpoint de registro (ya no autentica automáticamente)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          nombreEmpresa: formData.rol === 'comerciante' ? formData.nombreEmpresa : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear la cuenta');
      }

      // Redirigir a la página de verificación con el email
      navigate(`/verificar-email?email=${encodeURIComponent(formData.email)}`);
      
    } catch (error: any) {
      console.error('Error en el registro:', error);
      setFormErrors([error.message || 'Error al crear la cuenta']);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar errores cuando el usuario comience a escribir
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Mostrar errores */}
        {(formErrors.length > 0 || error) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en el registro
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {error && <li>{error}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                Tipo de cuenta
              </label>
              <select
                id="rol"
                name="rol"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.rol}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="cliente">Cliente</option>
                <option value="comerciante">Comerciante</option>
              </select>
            </div>

            {formData.rol === 'comerciante' && (
              <div>
                <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700">
                  Nombre de la empresa *
                </label>
                <input
                  id="nombreEmpresa"
                  name="nombreEmpresa"
                  type="text"
                  required={formData.rol === 'comerciante'}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nombre de tu empresa o negocio"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>
        </form>

        {/* Botones de autenticación social */}
        <SocialLoginButtons isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RegisterPage; 