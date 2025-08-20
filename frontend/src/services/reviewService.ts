import api, { handleApiResponse } from './api';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Review {
  _id?: string;
  producto: string;
  usuario?: {
    _id: string;
    nombre: string;
  };
  pedido: string;
  calificacion: number;
  titulo?: string;
  comentario: string;
  aspectos?: {
    calidad?: number;
    precio?: number;
    entrega?: number;
    atencion?: number;
  };
  recomendaria?: boolean;
  verificada?: boolean;
  fechaCreacion?: string;
  respuestaComerciante?: {
    mensaje: string;
    fecha: string;
    comerciante: {
      _id: string;
      nombre: string;
    };
  };
  utilidad?: {
    votosUtiles: number;
    votosNoUtiles: number;
  };
}

export interface ReviewForm {
  producto: string;
  pedido: string;
  calificacion: number;
  titulo?: string;
  comentario: string;
  aspectos?: {
    calidad?: number;
    precio?: number;
    entrega?: number;
    atencion?: number;
  };
  recomendaria?: boolean;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  calificacion?: number;
  verificada?: boolean;
  orderBy?: 'fechaCreacion' | 'calificacion' | 'utilidad';
  order?: 'asc' | 'desc';
}

export const reviewService = {
  // Crear nueva reseña
  createReview: async (reviewData: ReviewForm): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/reviews', reviewData);
    return handleApiResponse(response);
  },

  // Obtener reseñas de un producto
  getProductReviews: async (productId: string, filters?: ReviewFilters): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/product/${productId}`, {
      params: filters
    });
    return handleApiResponse(response);
  },

  // Obtener reseñas del usuario
  getMyReviews: async (filters?: ReviewFilters): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews/my-reviews', {
      params: filters
    });
    return handleApiResponse(response);
  },

  // Obtener reseña por ID
  getReviewById: async (id: string): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/reviews/${id}`);
    return handleApiResponse(response);
  },

  // Actualizar reseña
  updateReview: async (id: string, reviewData: Partial<ReviewForm>): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    return handleApiResponse(response);
  },

  // Eliminar reseña
  deleteReview: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/reviews/${id}`);
    return handleApiResponse(response);
  },

  // Votar utilidad de reseña
  voteReview: async (id: string, voteType: 'util' | 'no_util'): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>(`/reviews/${id}/vote`, {
      tipoVoto: voteType
    });
    return handleApiResponse(response);
  },

  // Responder reseña (comerciante)
  respondToReview: async (id: string, mensaje: string): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>(`/reviews/${id}/respond`, {
      mensaje
    });
    return handleApiResponse(response);
  },

  // Reportar reseña
  reportReview: async (id: string, motivo: string, descripcion?: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(`/reviews/${id}/report`, {
      motivo,
      descripcion
    });
    return handleApiResponse(response);
  },

  // Obtener estadísticas de reseñas para comerciante
  getMerchantReviewStats: async (): Promise<{
    totalReseñas: number;
    calificacionPromedio: number;
    distribucionCalificaciones: { [key: number]: number };
    reseñasRecientes: Review[];
  }> => {
    const response = await api.get<ApiResponse<any>>('/reviews/merchant/stats');
    return handleApiResponse(response);
  },

  // Verificar si el usuario puede reseñar un producto
  canReviewProduct: async (productId: string, orderId: string): Promise<{
    puedeReseñar: boolean;
    razon?: string;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/reviews/can-review/${productId}/${orderId}`);
    return handleApiResponse(response);
  }
};

export default reviewService; 