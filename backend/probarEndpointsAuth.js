const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Función para probar endpoints con autenticación
const probarEndpointsConAuth = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const User = require('./models/User');

    // Buscar comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró comerciante');
      return;
    }

    console.log(`🔍 Comerciante encontrado: ${comerciante.nombre} (${comerciante._id})`);

    // Generar token JWT para el comerciante
    const token = jwt.sign(
      { id: comerciante._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ Token generado para pruebas');

    // Ahora probar los endpoints con axios
    const axios = require('axios');
    const BASE_URL = 'http://localhost:5000/api';

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📊 PROBANDO ENDPOINTS...');

    // 1. Probar analytics
    try {
      console.log('\n1️⃣ Probando /api/analytics/merchant...');
      const analyticsResponse = await axios.get(`${BASE_URL}/analytics/merchant`, { headers });
      console.log('✅ Analytics - Status:', analyticsResponse.status);
      console.log('📊 Analytics - Datos:', {
        totalIngresos: analyticsResponse.data.datos?.totalIngresos || 0,
        pedidosDelMes: analyticsResponse.data.datos?.pedidosDelMes || 0,
        totalReseñas: analyticsResponse.data.datos?.totalReseñas || 0,
        calificacionPromedio: analyticsResponse.data.datos?.calificacionPromedio || 0
      });
    } catch (error) {
      console.log('❌ Error en analytics:', error.response?.data || error.message);
    }

    // 2. Probar dashboard
    try {
      console.log('\n2️⃣ Probando /api/commerce/dashboard...');
      const dashboardResponse = await axios.get(`${BASE_URL}/commerce/dashboard`, { headers });
      console.log('✅ Dashboard - Status:', dashboardResponse.status);
      console.log('📊 Dashboard - Datos:', {
        totalProductos: dashboardResponse.data.datos?.resumenGeneral?.totalProductos || 0,
        ventasDelMes: dashboardResponse.data.datos?.resumenGeneral?.ventasDelMes || 0,
        pedidosDelMes: dashboardResponse.data.datos?.resumenGeneral?.pedidosDelMes || 0
      });
    } catch (error) {
      console.log('❌ Error en dashboard:', error.response?.data || error.message);
    }

    // 3. Probar reseñas
    try {
      console.log('\n3️⃣ Probando /api/reviews/merchant/stats...');
      const reviewsResponse = await axios.get(`${BASE_URL}/reviews/merchant/stats`, { headers });
      console.log('✅ Reviews - Status:', reviewsResponse.status);
      console.log('📊 Reviews - Datos:', {
        totalReseñas: reviewsResponse.data.datos?.totalReseñas || 0,
        calificacionPromedio: reviewsResponse.data.datos?.calificacionPromedio || 0
      });
    } catch (error) {
      console.log('❌ Error en reviews:', error.response?.data || error.message);
    }

    // 4. Probar sales
    try {
      console.log('\n4️⃣ Probando /api/commerce/sales...');
      const salesResponse = await axios.get(`${BASE_URL}/commerce/sales?periodo=30d`, { headers });
      console.log('✅ Sales - Status:', salesResponse.status);
      console.log('📊 Sales - Datos:', {
        totalPedidos: salesResponse.data.datos?.resumen?.totalPedidos || 0,
        totalIngresos: salesResponse.data.datos?.resumen?.totalIngresos || 0
      });
    } catch (error) {
      console.log('❌ Error en sales:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Desconectado de MongoDB');
  }
};

probarEndpointsConAuth();
