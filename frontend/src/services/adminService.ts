import api, { handleApiResponse } from './api';
import { ApiResponse, PaginatedResponse, User, Product, Order, ProductFilters, OrderFilters } from '../types';

interface UserFilters {
  rol?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/admin/dashboard/stats');
    return handleApiResponse(response);
  },

  // Gestión de usuarios
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      params: filters
    });
    return handleApiResponse(response);
  },

  // Actualizar usuario
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, userData);
    return handleApiResponse(response);
  },

  // Suspender/activar usuario
  toggleUserStatus: async (id: string, activo: boolean) => {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, {
      activo
    });
    return handleApiResponse(response);
  },

  // Gestión de productos
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>('/admin/products', {
      params: filters
    });
    return handleApiResponse(response);
  },

  // Aprobar/rechazar producto
  approveProduct: async (productId: string): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${productId}/approve`);
    return handleApiResponse(response);
  },

  rejectProduct: async (productId: string, motivo: string): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${productId}/reject`, { motivo });
    return handleApiResponse(response);
  },

  // Eliminar producto
  deleteProduct: async (productId: string): Promise<{ mensaje: string }> => {
    const response = await api.delete<ApiResponse<{ mensaje: string }>>(`/admin/products/${productId}`);
    return handleApiResponse(response);
  },

  // Obtener reportes generales
  getGeneralReports: async (periodo: string) => {
    const response = await api.get<ApiResponse<any>>(`/admin/reports/general`, {
      params: { periodo }
    });
    return handleApiResponse(response);
  },

  // Gestión de configuración
  getSystemConfig: async () => {
    const response = await api.get<ApiResponse<any>>('/admin/config');
    return handleApiResponse(response);
  },

  updateSystemConfig: async (config: any) => {
    const response = await api.put<ApiResponse<any>>('/admin/config', config);
    return handleApiResponse(response);
  },

  // Órdenes
  getOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/admin/orders', {
      params: filters
    });
    return handleApiResponse(response);
  },

  updateOrderStatus: async (orderId: string, estado: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { estado });
    return handleApiResponse(response);
  },

  // Reportes
  generateReport: async (tipo: string, filtros: any): Promise<Blob> => {
    const response = await api.get(`/admin/reports/${tipo}`, {
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default adminService; 