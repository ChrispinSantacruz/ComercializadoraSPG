import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <span className="text-6xl">✗</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pago Rechazado
          </h1>
          <p className="text-xl text-gray-600">
            No se pudo procesar tu pago
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">¿Por qué falló mi pago?</h3>
          {reason ? (
            <p className="text-sm text-red-700">{reason}</p>
          ) : (
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Fondos insuficientes</li>
              <li>• Datos de tarjeta incorrectos</li>
              <li>• Transacción rechazada por el banco</li>
              <li>• Límite de compras excedido</li>
            </ul>
          )}
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Número de Orden:</strong> {orderId}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Tu orden sigue activa. Puedes intentar pagar nuevamente.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Sugerencias</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verifica que tus datos sean correctos</li>
            <li>• Contacta a tu banco si el problema persiste</li>
            <li>• Intenta con otro método de pago</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/carrito')}
            className="flex-1 px-6 py-3 bg-[#f2902f] text-white rounded-lg hover:bg-[#e07d1f] transition-colors font-medium"
          >
            Reintentar Pago
          </button>
          <button
            onClick={() => navigate('/productos')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Seguir Comprando
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="mailto:soporte@andinoexpress.com"
            className="text-[#0d8e76] hover:underline text-sm font-medium"
          >
            ¿Necesitas ayuda? Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;