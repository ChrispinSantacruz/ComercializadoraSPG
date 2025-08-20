import api, { handleApiResponse } from './api';
import { Category, ApiResponse } from '../types';

export const categoryService = {
  // Obtener todas las categorías
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return handleApiResponse(response);
  },

  // Obtener categorías activas (para público)
  getActiveCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories/active');
    return handleApiResponse(response);
  },

  // Obtener categoría por ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return handleApiResponse(response);
  },

  // Obtener categoría por slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return handleApiResponse(response);
  },

  // Crear nueva categoría (admin)
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', categoryData);
    return handleApiResponse(response);
  },

  // Actualizar categoría (admin)
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return handleApiResponse(response);
  },

  // Eliminar categoría (admin)
  deleteCategory: async (id: string): Promise<{ mensaje: string }> => {
    const response = await api.delete<ApiResponse<{ mensaje: string }>>(`/categories/${id}`);
    return handleApiResponse(response);
  },

  // Obtener categorías jerárquicas (con hijos)
  getCategoriesTree: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories/tree');
    return handleApiResponse(response);
  }
};

export default categoryService; 