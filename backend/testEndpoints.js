const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Función para hacer login y obtener token
const login = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'comerciante@prueba.com',
      password: 'password123'
    });
    return response.data.datos.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return null;
  }
};

// Función para probar los endpoints
const probarEndpoints = async () => {
  console.log('🧪 Iniciando pruebas de endpoints...');
  
  // 1. Hacer login
  console.log('\n1️⃣ Haciendo login...');
  const token = await login();
  if (!token) {
    console.log('❌ No se pudo obtener token. Saliendo...');
    return;
  }
  console.log('✅ Login exitoso. Token obtenido.');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Probar analytics del comerciante
  console.log('\n2️⃣ Probando endpoint de analytics del comerciante...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/merchant`, { headers });
    console.log('✅ Analytics obtenidos exitosamente');
    console.log(`   📊 Total ingresos: $${response.data.datos.totalIngresos?.toLocaleString('es-CO') || 0}`);
    console.log(`   🛍️ Total productos: ${response.data.datos.totalProductos || 0}`);
    console.log(`   📦 Pedidos del mes: ${response.data.datos.pedidosDelMes || 0}`);
    console.log(`   ⭐ Total reseñas: ${response.data.datos.totalReseñas || 0}`);
    console.log(`   📈 Calificación promedio: ${response.data.datos.calificacionPromedio?.toFixed(1) || 0}`);
  } catch (error) {
    console.log('❌ Error en analytics:', error.response?.data?.mensaje || error.message);
  }

  // 3. Probar dashboard del comerciante
  console.log('\n3️⃣ Probando endpoint de dashboard del comerciante...');
  try {
    const response = await axios.get(`${BASE_URL}/commerce/dashboard`, { headers });
    console.log('✅ Dashboard obtenido exitosamente');
    console.log(`   📊 Total productos: ${response.data.datos.resumenGeneral?.totalProductos || 0}`);
    console.log(`   💰 Ventas del mes: $${response.data.datos.resumenGeneral?.ventasDelMes?.toLocaleString('es-CO') || 0}`);
    console.log(`   📦 Pedidos del mes: ${response.data.datos.resumenGeneral?.pedidosDelMes || 0}`);
    console.log(`   ⚠️ Productos agotados: ${response.data.datos.resumenGeneral?.productosAgotados || 0}`);
  } catch (error) {
    console.log('❌ Error en dashboard:', error.response?.data?.mensaje || error.message);
  }

  // 4. Probar estadísticas de reseñas del comerciante
  console.log('\n4️⃣ Probando endpoint de estadísticas de reseñas...');
  try {
    const response = await axios.get(`${BASE_URL}/reviews/merchant/stats`, { headers });
    console.log('✅ Estadísticas de reseñas obtenidas exitosamente');
    console.log(`   ⭐ Total reseñas: ${response.data.datos.totalReseñas || 0}`);
    console.log(`   📈 Calificación promedio: ${response.data.datos.calificacionPromedio || 0}`);
    console.log(`   📝 Reseñas recientes: ${response.data.datos.reseñasRecientes?.length || 0}`);
  } catch (error) {
    console.log('❌ Error en estadísticas de reseñas:', error.response?.data?.mensaje || error.message);
  }

  // 5. Probar análisis de ventas
  console.log('\n5️⃣ Probando endpoint de análisis de ventas...');
  try {
    const response = await axios.get(`${BASE_URL}/commerce/sales?periodo=30d`, { headers });
    console.log('✅ Análisis de ventas obtenido exitosamente');
    console.log(`   📊 Total pedidos: ${response.data.datos.resumen?.totalPedidos || 0}`);
    console.log(`   💰 Total ingresos: $${response.data.datos.resumen?.totalIngresos?.toLocaleString('es-CO') || 0}`);
    console.log(`   📈 Crecimiento: ${response.data.datos.resumen?.crecimiento?.toFixed(1) || 0}%`);
  } catch (error) {
    console.log('❌ Error en análisis de ventas:', error.response?.data?.mensaje || error.message);
  }

  console.log('\n🎉 Pruebas completadas!');
};

// Ejecutar las pruebas
if (require.main === module) {
  probarEndpoints().catch(console.error);
}

module.exports = { probarEndpoints };
