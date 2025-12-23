import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentPendingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
            <span className="text-6xl">⏱️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pago en Proceso
          </h1>
          <p className="text-xl text-gray-600">
            Tu pago está siendo verificado
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">¿Qué significa esto?</h3>
          <p className="text-sm text-yellow-700">
            Tu transacción está siendo procesada por el banco. Esto puede tardar unos minutos.
            Te notificaremos por correo cuando se confirme el pago.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Número de Orden:</strong> {orderId}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Puedes verificar el estado de tu pedido en cualquier momento.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 px-6 py-3 bg-[#0d8e76] text-white rounded-lg hover:bg-[#0b7a64] transition-colors font-medium"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;