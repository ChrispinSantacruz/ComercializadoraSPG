import { getImageUrl, checkImageExists } from './imageUtils';

/**
 * Prueba la configuración de imágenes
 */
export const testImageConfiguration = async () => {
  console.log('🧪 INICIANDO PRUEBA DE CONFIGURACIÓN DE IMÁGENES');
  console.log('================================================');

  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL || '❌ NO CONFIGURADA');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('');

  // Probar diferentes tipos de URLs
  const testUrls = [
    null,
    undefined,
    'product-123.jpg',
    '/uploads/productos/product-123.jpg',
    'https://res.cloudinary.com/example/image.jpg',
    'http://localhost:5000/uploads/productos/product-123.jpg'
  ];

  console.log('🖼️ Probando URLs de imagen:');
  testUrls.forEach((url, index) => {
    const processedUrl = getImageUrl(url);
    console.log(`  ${index + 1}. Entrada: "${url}"`);
    console.log(`     Salida: "${processedUrl}"`);
    console.log('');
  });

  // Verificar conexión con el backend
  console.log('🌐 Verificando conexión con el backend...');
  try {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/products`);
    console.log('  ✅ Backend responde correctamente');
    console.log('  📊 Status:', response.status);
  } catch (error) {
    console.log('  ❌ Error conectando con el backend:', error);
  }

  console.log('');
  console.log('✅ Prueba completada');
};

/**
 * Prueba una imagen específica
 */
export const testSpecificImage = async (imageUrl: string) => {
  console.log(`🧪 Probando imagen: ${imageUrl}`);
  
  const processedUrl = getImageUrl(imageUrl);
  console.log(`📝 URL procesada: ${processedUrl}`);
  
  const exists = await checkImageExists(processedUrl);
  console.log(`📊 ¿Existe la imagen? ${exists ? '✅ Sí' : '❌ No'}`);
  
  return { processedUrl, exists };
};

/**
 * Prueba múltiples imágenes
 */
export const testMultipleImages = async (imageUrls: string[]) => {
  console.log(`🧪 Probando ${imageUrls.length} imágenes...`);
  
  const results = await Promise.all(
    imageUrls.map(async (url) => {
      const result = await testSpecificImage(url);
      return { originalUrl: url, ...result };
    })
  );
  
  const successful = results.filter(r => r.exists).length;
  const failed = results.filter(r => !r.exists).length;
  
  console.log('');
  console.log('📊 RESULTADOS:');
  console.log(`  ✅ Exitosas: ${successful}`);
  console.log(`  ❌ Fallidas: ${failed}`);
  console.log(`  📈 Tasa de éxito: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  return results;
}; 