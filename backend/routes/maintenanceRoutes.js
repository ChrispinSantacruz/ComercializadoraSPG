const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');

// Endpoint temporal para actualizar productos pendientes en producción
router.post('/update-pending-products', async (req, res) => {
  try {
    console.log('🔄 Iniciando actualización de productos pendientes...');
    
    // Verificar que estamos en producción o que se envía una clave especial
    const secretKey = req.headers['x-update-secret'] || req.body.secret;
    if (!secretKey || secretKey !== process.env.UPDATE_SECRET || 'admin-update-2024') {
      return res.status(403).json({
        error: 'No autorizado'
      });
    }
    
    // Encontrar todos los productos con estado 'pendiente'
    const productsPending = await Product.find({ estado: 'pendiente' });
    console.log(`📋 Productos pendientes encontrados: ${productsPending.length}`);
    
    if (productsPending.length === 0) {
      return res.json({
        message: 'No hay productos pendientes para actualizar',
        updated: 0
      });
    }
    
    // Actualizar todos los productos pendientes a 'aprobado'
    const result = await Product.updateMany(
      { estado: 'pendiente' },
      { 
        $set: { 
          estado: 'aprobado',
          fechaActualizacion: new Date()
        }
      }
    );
    
    console.log(`✅ Productos actualizados: ${result.modifiedCount}`);
    
    // También actualizar productos con estado 'rechazado' si los hay
    const rejectedResult = await Product.updateMany(
      { estado: 'rechazado' },
      { 
        $set: { 
          estado: 'aprobado',
          fechaActualizacion: new Date()
        }
      }
    );
    
    // Corregir rutas de imágenes con backslashes
    await mongoose.connection.db.collection('products').updateMany(
      { "imagenes.url": /\\/g },
      [
        {
          $set: {
            imagenes: {
              $map: {
                input: "$imagenes",
                as: "img",
                in: {
                  $mergeObjects: [
                    "$$img",
                    {
                      url: {
                        $replaceAll: {
                          input: "$$img.url",
                          find: "\\",
                          replacement: "/"
                        }
                      }
                    }
                  ]
                }
              }
            },
            fechaActualizacion: new Date()
          }
        }
      ]
    );
    
    // Mostrar estadísticas finales
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      message: 'Productos actualizados exitosamente',
      pendingUpdated: result.modifiedCount,
      rejectedUpdated: rejectedResult.modifiedCount,
      stats: stats,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Endpoint para verificar estado de productos
router.get('/product-stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalProducts = await Product.countDocuments({});
    const productsWithImages = await Product.countDocuments({
      imagenes: { $exists: true, $not: { $size: 0 } }
    });
    
    res.json({
      totalProducts,
      productsWithImages,
      productsWithoutImages: totalProducts - productsWithImages,
      statusBreakdown: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

// Servir la herramienta de mantenimiento como HTML
router.get('/tool', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mantenimiento de Productos - AndinoExpress</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">🛠️ Mantenimiento de Productos</h1>
            
            <div class="space-y-6">
                <!-- Estado actual -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h2 class="text-lg font-semibold mb-4">📊 Estado Actual</h2>
                    <button onclick="checkStatus()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4">
                        Verificar Estado
                    </button>
                    <div id="status-result" class="text-sm bg-gray-50 p-3 rounded hidden"></div>
                </div>

                <!-- Actualización -->
                <div class="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h2 class="text-lg font-semibold mb-4 text-orange-800">🔄 Actualizar Productos</h2>
                    <p class="text-orange-700 mb-4">Esto actualizará todos los productos pendientes a estado "aprobado" y corregirá rutas de imágenes.</p>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-orange-700 mb-2">Clave de actualización:</label>
                        <input type="password" id="update-secret" placeholder="Ingresa la clave" value="admin-update-2024"
                               class="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    
                    <button onclick="updateProducts()" class="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
                        Ejecutar Actualización
                    </button>
                    <div id="update-result" class="mt-4 text-sm hidden"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_URL = window.location.origin + '/api/maintenance';
        
        async function checkStatus() {
            const resultDiv = document.getElementById('status-result');
            resultDiv.className = 'text-sm bg-gray-50 p-3 rounded';
            resultDiv.innerHTML = '🔄 Verificando estado...';
            
            try {
                const response = await fetch(API_URL + '/product-stats');
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <h3 class="font-semibold text-green-700 mb-2">✅ Estado obtenido exitosamente</h3>
                        <div class="space-y-2">
                            <p><strong>Total de productos:</strong> \${data.totalProducts}</p>
                            <p><strong>Productos con imágenes:</strong> \${data.productsWithImages}</p>
                            <p><strong>Productos sin imágenes:</strong> \${data.productsWithoutImages}</p>
                            <div>
                                <strong>Por estado:</strong>
                                <ul class="ml-4 mt-1">
                                    \${data.statusBreakdown.map(stat => 
                                        \`<li>• \${stat._id}: \${stat.count} productos</li>\`
                                    ).join('')}
                                </ul>
                            </div>
                            <p class="text-xs text-gray-500">Última actualización: \${new Date(data.timestamp).toLocaleString()}</p>
                        </div>
                    \`;
                    resultDiv.className = 'text-sm bg-green-50 p-3 rounded border border-green-200';
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <h3 class="font-semibold text-red-700 mb-2">❌ Error</h3>
                    <p>\${error.message}</p>
                \`;
                resultDiv.className = 'text-sm bg-red-50 p-3 rounded border border-red-200';
            }
        }
        
        async function updateProducts() {
            const secret = document.getElementById('update-secret').value;
            const resultDiv = document.getElementById('update-result');
            
            if (!secret) {
                alert('Por favor ingresa la clave de actualización');
                return;
            }
            
            resultDiv.className = 'mt-4 text-sm bg-blue-50 p-3 rounded';
            resultDiv.innerHTML = '🔄 Ejecutando actualización...';
            
            try {
                const response = await fetch(API_URL + '/update-pending-products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-update-secret': secret
                    },
                    body: JSON.stringify({ secret })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <h3 class="font-semibold text-green-700 mb-2">✅ Actualización completada</h3>
                        <div class="space-y-2">
                            <p><strong>Productos pendientes actualizados:</strong> \${data.pendingUpdated}</p>
                            <p><strong>Productos rechazados actualizados:</strong> \${data.rejectedUpdated}</p>
                            <div>
                                <strong>Estado final:</strong>
                                <ul class="ml-4 mt-1">
                                    \${data.stats.map(stat => 
                                        \`<li>• \${stat._id}: \${stat.count} productos</li>\`
                                    ).join('')}
                                </ul>
                            </div>
                            <p class="text-xs text-gray-500">Completado: \${new Date(data.timestamp).toLocaleString()}</p>
                        </div>
                    \`;
                    resultDiv.className = 'mt-4 text-sm bg-green-50 p-3 rounded border border-green-200';
                    
                    // Auto-refresh status
                    setTimeout(checkStatus, 2000);
                } else {
                    throw new Error(data.error || data.message || 'Error desconocido');
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <h3 class="font-semibold text-red-700 mb-2">❌ Error en actualización</h3>
                    <p>\${error.message}</p>
                \`;
                resultDiv.className = 'mt-4 text-sm bg-red-50 p-3 rounded border border-red-200';
            }
        }
        
        // Auto-check status on load
        document.addEventListener('DOMContentLoaded', checkStatus);
    </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;