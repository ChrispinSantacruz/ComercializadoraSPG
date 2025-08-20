/**
 * Utilidades de debug para la aplicación
 */

import { getImageUrl } from './imageUtils';

/**
 * Verifica si el backend está respondiendo
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Backend conectado:', data.message || 'OK');
      }
      return true;
    }
    return false;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Backend no responde:', error);
    }
    return false;
  }
}; 

/**
 * Función de debug para verificar las URLs de las imágenes en los pedidos
 */
export const debugOrderImages = (order: any) => {
  console.log('🔍 Debug de imágenes del pedido:', order.numeroOrden);
  
  if (order.productos && Array.isArray(order.productos)) {
    order.productos.forEach((item: any, index: number) => {
      console.log(`   Producto ${index + 1}: ${item.producto?.nombre || 'Sin nombre'}`);
      console.log(`     - Campo imagen del pedido: ${item.imagen}`);
      console.log(`     - Imágenes del producto:`, item.producto?.imagenes);
      
      // Probar diferentes formas de obtener la imagen
      const imagenPedido = item.imagen;
      const imagenProducto = item.producto?.imagenes?.[0];
      const imagenProductoUrl = item.producto?.imagenes?.[0]?.url;
      
      console.log(`     - URL final (imagen del pedido): ${getImageUrl(imagenPedido)}`);
      console.log(`     - URL final (imagen del producto): ${getImageUrl(imagenProducto)}`);
      console.log(`     - URL final (imagen del producto .url): ${getImageUrl(imagenProductoUrl)}`);
    });
  }
};

/**
 * Función para verificar si una URL de imagen es válida
 */
export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verificando URL de imagen:', url, error);
    return false;
  }
}; 