// Script simple para probar los endpoints desde Node.js mientras el backend corre
const https = require('https');
const http = require('http');

// Token generado
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjY0YWI2NTY3NmUxY2U1YzUwNmJhZSIsImVtYWlsIjoiYWRtaW5AY29tZXJjaWFudGUuY29tIiwicm9sIjoiY29tZXJjaWFudGUiLCJpYXQiOjE3NTY5NTI4MDAsImV4cCI6MTc1NzAzOTIwMH0.1jyfejB3FgAT0EkTGcjH5kOkI62uWuMdDPRimfdd60M';

async function probarEndpoint(path, descripcion) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Probando ${descripcion}...`);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode === 200 && jsonData.exito) {
            console.log(`   ✅ ${descripcion} - OK`);
            
            // Mostrar información específica según el endpoint
            if (path.includes('analytics/merchant')) {
              const datos = jsonData.datos;
              console.log(`      💰 Total Ingresos: $${datos.totalIngresos || 0}`);
              console.log(`      📊 Ingresos del Mes: $${datos.ingresosDelMes || 0}`);
              console.log(`      🛍️ Ventas del Mes: ${datos.ventasDelMes || 0}`);
              console.log(`      📦 Total Productos: ${datos.totalProductos || 0}`);
              console.log(`      ⭐ Total Reseñas: ${datos.totalReseñas || 0}`);
              console.log(`      📈 Calificación Promedio: ${datos.calificacionPromedio?.toFixed(1) || 0}`);
              console.log(`      🚛 Pedidos en Tránsito: ${datos.pedidosEnTransito || 0}`);
              console.log(`      📋 Productos Agotados: ${datos.productosAgotados || 0}`);
            } else if (path.includes('commerce/dashboard')) {
              const datos = jsonData.datos;
              console.log(`      🏪 Resumen General:`, datos.resumenGeneral || {});
              console.log(`      📈 Alertas: ${datos.alertas?.length || 0}`);
            } else if (path.includes('reviews/merchant/stats')) {
              const datos = jsonData.datos;
              console.log(`      ⭐ Total Reseñas: ${datos.totalReseñas || 0}`);
              console.log(`      📊 Calificación Promedio: ${datos.calificacionPromedio || 0}`);
              console.log(`      📝 Reseñas Recientes: ${datos.reseñasRecientes?.length || 0}`);
            }
          } else {
            console.log(`   ❌ ${descripcion} - Error: ${jsonData.mensaje || 'Error desconocido'}`);
          }
          
        } catch (e) {
          console.log(`   ❌ ${descripcion} - Error parsing JSON: ${data.substring(0, 200)}...`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`   ❌ ${descripcion} - Request Error: ${e.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ ${descripcion} - Timeout`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function probarTodosLosEndpoints() {
  console.log('🚀 Probando endpoints del comerciante...\n');
  
  // Lista de endpoints para probar
  const endpoints = [
    ['/analytics/merchant', 'Analytics del Comerciante'],
    ['/commerce/dashboard', 'Dashboard del Comerciante'],
    ['/reviews/merchant/stats', 'Estadísticas de Reseñas'],
    ['/commerce/sales?periodo=30d', 'Análisis de Ventas']
  ];
  
  for (const [path, descripcion] of endpoints) {
    await probarEndpoint(path, descripcion);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo entre requests
  }
  
  console.log('\n✅ Prueba de endpoints completada');
}

probarTodosLosEndpoints();
