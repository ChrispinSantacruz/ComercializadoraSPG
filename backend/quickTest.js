const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🔍 Probando API...\n');
  
  try {
    // Test 1: Verificar servidor
    console.log('1. Verificando servidor...');
    const serverResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Servidor funcionando:', serverResponse.data.message);
    console.log('');
    
    // Test 2: Verificar rutas del carrito
    console.log('2. Verificando rutas del carrito...');
    try {
      // Esta debería fallar con 401 (no autorizado) pero no con 404
      await axios.put(`${BASE_URL}/cart/update`, {});
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Ruta /cart/update existe (401 Unauthorized - esperado)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Ruta /cart/update no encontrada (404)');
      } else {
        console.log('⚠️ Error inesperado:', error.response?.status);
      }
    }
    console.log('');
    
    // Test 3: Verificar rutas de órdenes
    console.log('3. Verificando rutas de órdenes...');
    try {
      await axios.get(`${BASE_URL}/orders/merchant-orders`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Ruta /orders/merchant-orders existe (401 Unauthorized - esperado)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Ruta /orders/merchant-orders no encontrada (404)');
      } else {
        console.log('⚠️ Error inesperado:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Error conectando al servidor:', error.message);
    console.log('💡 ¿Está el servidor corriendo en puerto 5000?');
  }
}

// Esperar 3 segundos y probar
setTimeout(testAPI, 3000); 