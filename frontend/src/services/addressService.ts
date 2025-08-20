import api, { handleApiResponse } from './api';
import { Address, AddressForm, ApiResponse } from '../types';

export const addressService = {
  // Obtener todas las direcciones del usuario
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get<ApiResponse<Address[]>>('/addresses');
    return handleApiResponse(response);
  },

  // Obtener dirección por ID
  getAddressById: async (id: string): Promise<Address> => {
    const response = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
    return handleApiResponse(response);
  },

  // Crear nueva dirección
  createAddress: async (addressData: AddressForm): Promise<Address> => {
    const response = await api.post<ApiResponse<Address>>('/addresses', addressData);
    return handleApiResponse(response);
  },

  // Actualizar dirección
  updateAddress: async (id: string, addressData: Partial<AddressForm>): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/addresses/${id}`, addressData);
    return handleApiResponse(response);
  },

  // Eliminar dirección
  deleteAddress: async (id: string): Promise<{ mensaje: string }> => {
    const response = await api.delete<ApiResponse<{ mensaje: string }>>(`/addresses/${id}`);
    return handleApiResponse(response);
  },

  // Establecer dirección como predeterminada
  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/addresses/${id}/default`);
    return handleApiResponse(response);
  },

  // Validar dirección
  validateAddress: async (addressData: AddressForm): Promise<{ valida: boolean; sugerencias?: any[] }> => {
    const response = await api.post<ApiResponse<{ valida: boolean; sugerencias?: any[] }>>('/addresses/validate', addressData);
    return handleApiResponse(response);
  }
};

export default addressService; 