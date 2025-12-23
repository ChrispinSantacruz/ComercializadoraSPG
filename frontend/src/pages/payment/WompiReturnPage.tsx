import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const WompiReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const orderId = searchParams.get('orderId');
      const reference = searchParams.get('reference');

      if (!orderId) {
        setError('No se encontró el ID de la orden');
        setStatus('failed');
        return;
      }

      // Esperar un momento para que el webhook procese el pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Consultar el estado del pedido
      const response = await api.get(`/orders/${orderId}`);
      
      if (response.data.exito) {
        const order = response.data.datos;
        setOrderData(order);

        // Verificar el estado del pago
        if (order.paymentInfo?.paymentStatus === 'approved' || order.estado === 'pagado' || order.estado === 'confirmado') {
          setStatus('success');
          // Redirigir a página de éxito después de 3 segundos
          setTimeout(() => {
            navigate(`/payment/success?orderId=${orderId}`);
          }, 3000);
        } else if (order.paymentInfo?.paymentStatus === 'pending' || order.estado === 'pendiente') {
          setStatus('pending');
          setTimeout(() => {
            navigate(`/payment/pending?orderId=${orderId}`);
          }, 3000);
        } else {
          setStatus('failed');
          setTimeout(() => {
            navigate(`/payment/failed?orderId=${orderId}`);
          }, 3000);
        }
      } else {
        setError('No se pudo verificar el estado del pago');
        setStatus('pending');
      }
    } catch (error: any) {
      console.error('Error verificando pago:', error);
      setError(error.response?.data?.mensaje || 'Error al verificar el pago');
      setStatus('pending');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d8e76]/10 to-[#1c3a35]/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#0d8e76] mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando tu pago...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu transacción
            </p>
            <div className="mt-6 bg-[#0d8e76]/10 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                ⏳ Esto puede tardar unos segundos
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu pago ha sido procesado correctamente
            </p>
            {orderData && (
              <div className="bg-[#0d8e76]/10 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Orden:</strong> {orderData.numeroOrden}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total:</strong> ${orderData.total?.toLocaleString('es-CO')} COP
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Redirigiendo en unos segundos...
            </p>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <span className="text-5xl">⏱️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pago Pendiente
            </h2>
            <p className="text-gray-600 mb-4">
              Tu pago está siendo procesado
            </p>
            {error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Redirigiendo en unos segundos...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <span className="text-5xl">✗</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pago Rechazado
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudo procesar tu pago
            </p>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <button
              onClick={() => navigate('/carrito')}
              className="mt-4 px-6 py-3 bg-[#f2902f] text-white rounded-lg hover:bg-[#e07d1f] transition-colors"
            >
              Volver al Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WompiReturnPage;
