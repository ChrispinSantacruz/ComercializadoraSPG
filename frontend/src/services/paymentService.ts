import api, { handleApiResponse } from './api';
import { PaymentMethod, PaymentRequest, PaymentResponse, ApiResponse } from '../types';

export const paymentService = {
  // Obtener métodos de pago disponibles
  getPaymentMethods: async () => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
    return handleApiResponse(response);
  },

  // Procesar pago
  processPayment: async (paymentData: PaymentRequest) => {
    const response = await api.post<ApiResponse<PaymentResponse>>('/payments/process', paymentData);
    return handleApiResponse(response);
  },

  // Confirmar pago PSE
  confirmPSEPayment: async (transactionId: string) => {
    const response = await api.post<ApiResponse<PaymentResponse>>(`/payments/pse/confirm/${transactionId}`);
    return handleApiResponse(response);
  },

  // Procesar pago Nequi
  processNequiPayment: async (phoneNumber: string, amount: number, orderId?: string) => {
    const response = await api.post<ApiResponse<PaymentResponse>>('/payments/nequi', {
      telefono: phoneNumber,
      monto: amount,
      pedidoId: orderId
    });
    return handleApiResponse(response);
  },

  // Verificar estado de transacción
  getTransactionStatus: async (transactionId: string) => {
    const response = await api.get<ApiResponse<{
      estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
      mensaje: string;
      detalles?: any;
    }>>(`/payments/transaction/${transactionId}/status`);
    return handleApiResponse(response);
  },

  // Obtener historial de pagos
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
  }) => {
    const response = await api.get<ApiResponse<{
      datos: Array<{
        _id: string;
        transaccionId: string;
        pedido: string;
        monto: number;
        metodo: string;
        estado: string;
        fecha: string;
        detalles?: any;
      }>;
      paginacion: {
        paginaActual: number;
        totalPaginas: number;
        totalElementos: number;
        elementosPorPagina: number;
      };
    }>>('/payments/history', {
      params
    });
    return handleApiResponse(response);
  },

  // Reembolsar pago
  refundPayment: async (transactionId: string, amount?: number, reason?: string) => {
    const response = await api.post<ApiResponse<{
      reembolsoId: string;
      estado: string;
      mensaje: string;
    }>>(`/payments/refund/${transactionId}`, {
      monto: amount,
      motivo: reason
    });
    return handleApiResponse(response);
  },

  // Obtener detalles de pago
  getPaymentDetails: async (transactionId: string) => {
    const response = await api.get<ApiResponse<{
      transaccionId: string;
      pedido: any;
      monto: number;
      metodo: PaymentMethod;
      estado: string;
      fecha: string;
      detalles: any;
      reembolsos?: Array<{
        reembolsoId: string;
        monto: number;
        fecha: string;
        motivo: string;
        estado: string;
      }>;
    }>>(`/payments/transaction/${transactionId}`);
    return handleApiResponse(response);
  },

  // Calcular tasas e impuestos
  calculateFees: async (amount: number, paymentMethod: string) => {
    const response = await api.post<ApiResponse<{
      subtotal: number;
      tasas: number;
      impuestos: number;
      total: number;
      desglose: Array<{
        concepto: string;
        valor: number;
        porcentaje?: number;
      }>;
    }>>('/payments/calculate-fees', {
      monto: amount,
      metodo: paymentMethod
    });
    return handleApiResponse(response);
  }
};

export default paymentService; 