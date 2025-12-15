import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Formatear error para mostrar al usuario
    const errorData = error.response?.data as any;
    let errorMessage = 
      errorData?.mensaje || 
      errorData?.message || 
      error.message || 
      'Error de conexión';
    
    // Si hay errores de validación específicos, incluirlos
    if (errorData?.errores && Array.isArray(errorData.errores)) {
      // Extraer solo los mensajes de error
      const mensajesError = errorData.errores.map((err: any) => 
        err.mensaje || err.msg || err.message || JSON.stringify(err)
      );
      errorMessage = mensajesError.join(', ');
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Helper para manejar respuestas de la API
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  const data = response.data;
  
  console.log('🔧 handleApiResponse - datos recibidos:', data);
  console.log('🔧 Es array?:', Array.isArray(data));
  console.log('🔧 Tiene exito?:', data && typeof data === 'object' && 'exito' in data);
  
  // Si la respuesta es un array directamente (para compatibilidad)
  if (Array.isArray(data)) {
    console.log('🔧 Devolviendo array directo');
    return data as T;
  }
  
  // Si la respuesta tiene formato { exito, datos }
  if (data && typeof data === 'object' && 'exito' in data) {
    if (data.exito) {
      console.log('🔧 Devolviendo data.datos');
      return data.datos as T;
    } else {
      throw new Error(data.mensaje || 'Error en la API');
    }
  }
  
  // Para respuestas directas
  console.log('🔧 Devolviendo data directo');
  return data as T;
};

export default api; 