import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const updateUser = useAuthStore(state => state.updateUser);
  
  const emailFromParams = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromParams);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendingCode, setResendingCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyEmailWithCode(email, code);
      
      // Si la respuesta incluye un token, actualizar el usuario en el store
      if (response.token) {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token: response.token,
            user: response.usuario,
            isAuthenticated: true
          }
        }));
        updateUser(response.usuario);
      }

      setSuccess('¡Email verificado exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setResendingCode(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resendVerificationCode(email);
      setSuccess('✅ Código generado exitosamente. Si no recibes el email en 2-3 minutos, revisa tu carpeta de spam o inténtalo nuevamente.');
    } catch (err: any) {
      if (err.message?.includes('timeout')) {
        setError('⏰ El envío está tomando más tiempo del esperado. El código fue generado, revisa tu email en unos minutos.');
      } else {
        setError(err.message || 'Error al reenviar el código');
      }
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d8e76]/10 to-[#1c3a35]/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d8e76]/10 rounded-full mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifica tu Email
          </h1>
          <p className="text-gray-600">
            {emailFromParams ? (
              <>Ingresa el código de verificación para completar tu registro</>
            ) : (
              <>Verifica tu cuenta ingresando el código de 6 dígitos</>
            )}
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2">
              Enviado a: <strong>{email}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <span className="text-xl mr-3">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <span className="text-xl mr-3">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
              disabled={!!emailFromParams}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificación
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold tracking-widest font-mono"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Ingresa el código de 6 dígitos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#f2902f] text-white py-3 rounded-lg font-semibold hover:bg-[#e07d1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Verificando...</span>
              </>
            ) : (
              'Verificar Email'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-3">
            ¿No recibiste el código?
          </p>
          <div className="space-y-2">
            <button
              onClick={handleResendCode}
              disabled={resendingCode || !email}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendingCode ? '📤 Reenviando...' : '📤 Reenviar código'}
            </button>
            <p className="text-xs text-gray-500">
              Revisa tu bandeja de entrada y spam. El código es válido por 15 minutos.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
