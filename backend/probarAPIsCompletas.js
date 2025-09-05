// Script para probar directamente con la API REST sin conectarse a MongoDB
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjY0YWI2NTY3NmUxY2U1YzUwNmJhZSIsImVtYWlsIjoiYWRtaW5AY29tZXJjaWFudGUuY29tIiwicm9sIjoiY29tZXJjaWFudGUiLCJpYXQiOjE3NTY5NTI4MDAsImV4cCI6MTc1NzAzOTIwMH0.1jyfejB3FgAT0EkTGcjH5kOkI62uWuMdDPRimfdd60M';

function llamarAPI(path, metodo = 'GET', datos = null) {
  return new Promise((resolve, reject) => {
    const opciones = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(opciones, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const resultado = JSON.parse(data);
          resolve({ status: res.statusCode, data: resultado });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (datos && metodo !== 'GET') {
      req.write(JSON.stringify(datos));
    }
    
    req.end();
  });
}

async function probarAPIs() {
  console.log('🚀 Probando APIs del comerciante...\n');

  // 1. Probar generar datos de prueba primero
  console.log('1️⃣ Generando datos de prueba...');
  try {
    const resultado = await llamarAPI('/analytics/generate-test-data', 'POST');
    console.log(`   Status: ${resultado.status}`);
    if (resultado.status === 200) {
      console.log('   ✅ Datos de prueba creados exitosamente');
    } else {
      console.log('   ❌ Error:', resultado.data?.mensaje || 'Error desconocido');
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }

  // Esperar un poco para que se procesen los datos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Probar analytics
  console.log('\n2️⃣ Probando analytics...');
  try {
    const resultado = await llamarAPI('/analytics/merchant');
    console.log(`   Status: ${resultado.status}`);
    if (resultado.status === 200) {
      const datos = resultado.data.datos;
      console.log('   ✅ Analytics obtenidos exitosamente');
      console.log(`      💰 Total Ingresos: $${datos.totalIngresos || 0}`);
      console.log(`      📊 Ingresos del Mes: $${datos.ingresosDelMes || 0}`);
      console.log(`      🛍️ Ventas del Mes: ${datos.ventasDelMes || 0}`);
      console.log(`      ⭐ Total Reseñas: ${datos.totalReseñas || 0}`);
      console.log(`      📈 Calificación Promedio: ${datos.calificacionPromedio || 0}`);
    } else {
      console.log('   ❌ Error:', resultado.data?.mensaje || 'Error desconocido');
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }

  // 3. Probar dashboard
  console.log('\n3️⃣ Probando dashboard...');
  try {
    const resultado = await llamarAPI('/commerce/dashboard');
    console.log(`   Status: ${resultado.status}`);
    if (resultado.status === 200) {
      const datos = resultado.data.datos;
      console.log('   ✅ Dashboard obtenido exitosamente');
      console.log(`      📦 Total Productos: ${datos.resumenGeneral?.totalProductos || 0}`);
      console.log(`      💰 Ventas del Mes: $${datos.resumenGeneral?.ventasDelMes || 0}`);
      console.log(`      📊 Porcentaje Cambio: ${datos.resumenGeneral?.porcentajeCambio || 0}%`);
      console.log(`      📋 Pedidos del Mes: ${datos.resumenGeneral?.pedidosDelMes || 0}`);
    } else {
      console.log('   ❌ Error:', resultado.data?.mensaje || 'Error desconocido');
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }

  // 4. Probar reseñas
  console.log('\n4️⃣ Probando estadísticas de reseñas...');
  try {
    const resultado = await llamarAPI('/reviews/merchant/stats');
    console.log(`   Status: ${resultado.status}`);
    if (resultado.status === 200) {
      const datos = resultado.data.datos;
      console.log('   ✅ Reseñas obtenidas exitosamente');
      console.log(`      ⭐ Total Reseñas: ${datos.totalReseñas || 0}`);
      console.log(`      📊 Calificación Promedio: ${datos.calificacionPromedio || 0}`);
      console.log(`      📝 Reseñas Recientes: ${datos.reseñasRecientes?.length || 0}`);
    } else {
      console.log('   ❌ Error:', resultado.data?.mensaje || 'Error desconocido');
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }

  console.log('\n✅ Pruebas completadas');
}

probarAPIs();
