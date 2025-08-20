import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        // Manejar errores de OAuth
        console.error('Error de OAuth:', error);
        
        let errorMessage = 'Error en la autenticación';
        switch (error) {
          case 'oauth_error':
            errorMessage = 'Error durante la autenticación con la red social';
            break;
          case 'oauth_cancelled':
            errorMessage = 'Autenticación cancelada por el usuario';
            break;
          default:
            errorMessage = 'Error desconocido en la autenticación';
        }
        
        navigate('/login?error=' + encodeURIComponent(errorMessage));
        return;
      }

      if (token && userParam) {
        try {
          // Decodificar datos del usuario
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Guardar token en localStorage
          const authData = {
            state: {
              user: userData,
              token: token,
              isAuthenticated: true
            }
          };
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          
          // Actualizar store
          updateUser(userData);
          
          // Redirigir al dashboard o home
          navigate('/', { replace: true });
          
        } catch (error) {
          console.error('Error procesando datos de OAuth:', error);
          navigate('/login?error=' + encodeURIComponent('Error procesando la autenticación'));
        }
      } else {
        // Faltan parámetros
        navigate('/login?error=' + encodeURIComponent('Datos de autenticación incompletos'));
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completando autenticación...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor espera mientras procesamos tu información
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback; 