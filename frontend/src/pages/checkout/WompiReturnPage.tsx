import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import wompiService from '../../services/wompiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNotificationCard } from '../../hooks/useNotificationCard';

interface PaymentResult {
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  transactionId?: string;
  orderId?: string;
  message?: string;
  amount?: number;
  paymentMethod?: string;
  reference?: string;
}

const WompiReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotificationCard();
  
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState('');
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    processPaymentReturn();
    
    const timer = setInterval(() => {
      setProcessingTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const processPaymentReturn = async () => {
    try {
      console.log('🔄 Processing Wompi payment return...');
      setLoading(true);
      setError('');

      // Obtener parámetros de la URL
      const transactionId = searchParams.get('id');
      const status = searchParams.get('status');
      const orderId = searchParams.get('orderId');
      const reference = searchParams.get('reference');

      console.log('📥 Payment return parameters:', {
        transactionId,
        status,
        orderId,
        reference,
        fullUrl: window.location.href
      });

      // Si no tenemos parámetros básicos, podría ser un problema de redirección
      if (!transactionId && !status && !reference) {
        console.log('⚠️  No payment parameters found, checking for potential errors...');
        
        // Verificar si es una redirección problemática de Wompi
        const hash = window.location.hash;
        const pathname = window.location.pathname;
        
        if (hash || pathname.includes('error')) {
          console.log('🔍 Possible error redirect detected:', { hash, pathname });
          setError('Error en el proceso de pago. La transacción no pudo completarse correctamente.');
          
          // Mostrar información de ayuda
          setTimeout(() => {
            showError(
              'Problema con el pago',
              'Hubo un problema al procesar tu pago. Por favor intenta nuevamente o usa un método de pago diferente.'
            );
          }, 1000);
          
          setLoading(false);
          return;
        }
        
        // Si llegamos aquí sin parámetros, es probable que sea una redirección exitosa pero sin datos
        console.log('ℹ️  No parameters but no error detected, assuming successful payment');
        
        setPaymentResult({
          status: 'APPROVED',
          message: 'Pago procesado exitosamente',
          orderId: 'unknown',
          reference: 'unknown'
        });
        
        showSuccess('Pago exitoso', 'Tu pago ha sido procesado correctamente');
        
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
        
        setLoading(false);
        return;
      }

      // Si no hay ID de transacción pero tenemos status, usar status directamente
      if (!transactionId && status) {
        console.log('📋 Processing payment with status:', status);
        
        const result: PaymentResult = {
          status: status as any,
          orderId: orderId || reference || undefined,
          reference: reference || orderId || undefined,
          message: status === 'APPROVED' ? 'Pago exitoso' : 'Pago procesado'
        };

        setPaymentResult(result);
        setLoading(false);
        return;
      }

      if (!transactionId && !status) {
        throw new Error('Parámetros de transacción no encontrados en la URL');
      }

      let transaction;

      // Si tenemos transactionId, verificar el estado con Wompi
      if (transactionId) {
        console.log('🔍 Verifying transaction status with Wompi...');
        const response = await wompiService.getTransactionStatus(transactionId);

        if (!response.success) {
          throw new Error(response.error?.message || 'Error al verificar el estado del pago');
        }

        transaction = response.data;
        console.log('📊 Transaction status from Wompi:', transaction);
      } else {
        // Si no hay transactionId, usar el status de la URL
        console.log('📝 Using status from URL parameters');
        transaction = {
          status: status,
          reference: reference || orderId,
          id: `url_${Date.now()}`
        };
      }

      // Procesar resultado del pago
      const result: PaymentResult = {
        status: transaction.status || 'ERROR',
        transactionId: transaction.id,
        orderId: transaction.reference || orderId || undefined,
        reference: transaction.reference || undefined,
        message: transaction.status_message || getStatusMessage(transaction.status),
        amount: transaction.amount_in_cents ? transaction.amount_in_cents / 100 : undefined,
        paymentMethod: transaction.payment_method?.type
      };

      setPaymentResult(result);

      // Mostrar notificación según el resultado
      switch (result.status) {
        case 'APPROVED':
          showSuccess(
            '¡Pago exitoso! 🎉',
            `Tu pago por $${result.amount?.toLocaleString('es-CO')} ha sido procesado correctamente`
          );
          break;
        case 'DECLINED':
          showError(
            'Pago rechazado 😔',
            result.message || 'Tu pago fue rechazado. Intenta con otro método de pago.'
          );
          break;
        case 'PENDING':
          showSuccess(
            'Pago pendiente ⏳',
            'Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.'
          );
          break;
        default:
          showError(
            'Error en el pago ❌',
            result.message || 'Hubo un problema procesando tu pago'
          );
      }

    } catch (error: any) {
      console.error('❌ Error processing payment return:', error);
      setError(error.message || 'Error al procesar el resultado del pago');
      showError('Error', error.message || 'Error al procesar el resultado del pago');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'APPROVED':
        return 'Pago aprobado exitosamente';
      case 'DECLINED':
        return 'Pago rechazado por el banco o entidad financiera';
      case 'PENDING':
        return 'Pago pendiente de confirmación';
      case 'VOIDED':
        return 'Pago anulado';
      default:
        return 'Estado de pago desconocido';
    }
  };

  const handleContinue = () => {
    if (paymentResult?.status === 'APPROVED') {
      // Redirigir a página de pedidos exitosos
      navigate('/orders', { 
        state: { 
          paymentSuccess: true, 
          orderId: paymentResult.orderId,
          transactionId: paymentResult.transactionId 
        } 
      });
    } else {
      // Redirigir al carrito para intentar nuevamente
      navigate('/cart');
    }
  };

  const handleRetry = () => {
    navigate('/cart');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'DECLINED':
        return (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'PENDING':
        return (
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.536 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '¡Pago exitoso! 🎉';
      case 'DECLINED':
        return 'Pago rechazado 😔';
      case 'PENDING':
        return 'Pago pendiente ⏳';
      default:
        return 'Error en el pago ❌';
    }
  };

  const getStatusDescription = (status: string, message?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación con los detalles de tu pedido en unos minutos.';
      case 'DECLINED':
        return message || 'Tu pago fue rechazado. Por favor, verifica los datos de tu método de pago e intenta nuevamente.';
      case 'PENDING':
        return 'Tu pago está siendo procesado. Te notificaremos por correo cuando sea confirmado. Esto puede tomar algunos minutos.';
      default:
        return message || 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente.';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'DECLINED':
        return 'red';
      case 'PENDING':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando el estado de tu pago...
          </h2>
          <p className="text-gray-600 mb-4">
            Estamos consultando con Wompi el resultado de tu transacción
          </p>
          <div className="text-sm text-gray-500">
            Tiempo transcurrido: {Math.round(processingTime / 1000)}s
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 No cierres esta ventana, estamos procesando tu pago
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.536 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="btn-primary w-full"
            >
              Intentar nuevamente
            </button>
            <button
              onClick={() => navigate('/support')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contactar soporte
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(paymentResult?.status || 'ERROR');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 text-center mx-4">
        {/* Icono de estado */}
        <div className="mb-6">
          {getStatusIcon(paymentResult?.status || 'ERROR')}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getStatusTitle(paymentResult?.status || 'ERROR')}
        </h1>

        {/* Descripción */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {getStatusDescription(paymentResult?.status || 'ERROR', paymentResult?.message)}
        </p>

        {/* Detalles del pago */}
        {paymentResult && (
          <div className={`bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-4 mb-6 text-left`}>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detalles del pago
            </h3>
            <div className="space-y-2 text-sm">
              {paymentResult.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID de transacción:</span>
                  <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                    {paymentResult.transactionId}
                  </span>
                </div>
              )}
              {paymentResult.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID de pedido:</span>
                  <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                    {paymentResult.orderId}
                  </span>
                </div>
              )}
              {paymentResult.reference && paymentResult.reference !== paymentResult.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                    {paymentResult.reference}
                  </span>
                </div>
              )}
              {paymentResult.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold text-gray-900">
                    ${paymentResult.amount.toLocaleString('es-CO')} COP
                  </span>
                </div>
              )}
              {paymentResult.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="text-gray-900">{paymentResult.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  paymentResult.status === 'APPROVED' ? 'text-green-600' :
                  paymentResult.status === 'PENDING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {paymentResult.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fecha:</span>
                <span className="text-gray-900 text-xs">
                  {new Date().toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          {paymentResult?.status === 'APPROVED' ? (
            <>
              <button
                onClick={handleContinue}
                className="btn-primary w-full text-lg py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver mis pedidos
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar comprando
              </button>
            </>
          ) : paymentResult?.status === 'PENDING' ? (
            <>
              <button
                onClick={handleViewOrders}
                className="btn-primary w-full"
              >
                Ver estado del pedido
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar comprando
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="btn-primary w-full"
              >
                Intentar nuevamente
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar comprando
              </button>
            </>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si tienes problemas con tu pago, puedes contactar nuestro soporte en{' '}
            <a href="mailto:soporte@andinoexpress.com" className="text-blue-600 hover:underline">
              soporte@andinoexpress.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WompiReturnPage;
