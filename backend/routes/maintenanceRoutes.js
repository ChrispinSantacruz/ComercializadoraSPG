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
    <style>
        body { background-color: #f9fafb; padding: 32px; font-family: Arial, sans-serif; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 32px; }
        .title { font-size: 24px; font-weight: bold; color: #374151; margin-bottom: 24px; }
        .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; }
        .btn-blue { background-color: #3b82f6; color: white; }
        .btn-blue:hover { background-color: #2563eb; }
        .btn-orange { background-color: #f97316; color: white; }
        .btn-orange:hover { background-color: #ea580c; }
        .input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; }
        .input:focus { outline: none; border-color: #3b82f6; }
        .result { padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 14px; }
        .result-success { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .result-error { background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .result-info { background-color: #f0f9ff; border: 1px solid #bae6fd; color: #0c4a6e; }
        .hidden { display: none; }
        .orange-section { background-color: #fff7ed; border-color: #fed7aa; }
        .orange-text { color: #c2410c; }
        .label { display: block; font-weight: 500; color: #374151; margin-bottom: 8px; }
        ul { margin: 8px 0; padding-left: 16px; }
        li { margin: 4px 0; }
        .small-text { font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">🛠️ Mantenimiento de Productos</h1>
            
            <!-- Estado actual -->
            <div class="section">
                <h2 class="section-title">📊 Estado Actual</h2>
                <button id="check-btn" class="btn btn-blue">Verificar Estado</button>
                <div id="status-result" class="hidden"></div>
            </div>

            <!-- Actualización -->
            <div class="section orange-section">
                <h2 class="section-title orange-text">🔄 Actualizar Productos</h2>
                <p class="orange-text">Esto actualizará todos los productos pendientes a estado "aprobado" y corregirá rutas de imágenes.</p>
                
                <div style="margin-bottom: 16px;">
                    <label class="label orange-text">Clave de actualización:</label>
                    <input type="password" id="update-secret" placeholder="Ingresa la clave" value="admin-update-2024" class="input">
                </div>
                
                <button id="update-btn" class="btn btn-orange">Ejecutar Actualización</button>
                <div id="update-result" class="hidden"></div>
            </div>
        </div>
    </div>

    <script>
        const API_URL = window.location.origin + '/api/maintenance';
        
        function checkStatus() {
            const resultDiv = document.getElementById('status-result');
            resultDiv.className = 'result result-info';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '🔄 Verificando estado...';
            
            fetch(API_URL + '/product-stats')
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    resultDiv.innerHTML = 
                        '<h3><strong>✅ Estado obtenido exitosamente</strong></h3>' +
                        '<div>' +
                            '<p><strong>Total de productos:</strong> ' + data.totalProducts + '</p>' +
                            '<p><strong>Productos con imágenes:</strong> ' + data.productsWithImages + '</p>' +
                            '<p><strong>Productos sin imágenes:</strong> ' + data.productsWithoutImages + '</p>' +
                            '<div>' +
                                '<strong>Por estado:</strong>' +
                                '<ul>' +
                                    data.statusBreakdown.map(function(stat) {
                                        return '<li>• ' + stat._id + ': ' + stat.count + ' productos</li>';
                                    }).join('') +
                                '</ul>' +
                            '</div>' +
                            '<p class="small-text">Última actualización: ' + new Date(data.timestamp).toLocaleString() + '</p>' +
                        '</div>';
                    resultDiv.className = 'result result-success';
                })
                .catch(function(error) {
                    resultDiv.innerHTML = '<h3><strong>❌ Error</strong></h3><p>' + error.message + '</p>';
                    resultDiv.className = 'result result-error';
                });
        }
        
        function updateProducts() {
            const secret = document.getElementById('update-secret').value;
            const resultDiv = document.getElementById('update-result');
            
            if (!secret) {
                alert('Por favor ingresa la clave de actualización');
                return;
            }
            
            resultDiv.className = 'result result-info';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '🔄 Ejecutando actualización...';
            
            fetch(API_URL + '/update-pending-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-update-secret': secret
                },
                body: JSON.stringify({ secret: secret })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                resultDiv.innerHTML = 
                    '<h3><strong>✅ Actualización completada</strong></h3>' +
                    '<div>' +
                        '<p><strong>Productos pendientes actualizados:</strong> ' + data.pendingUpdated + '</p>' +
                        '<p><strong>Productos rechazados actualizados:</strong> ' + data.rejectedUpdated + '</p>' +
                        '<div>' +
                            '<strong>Estado final:</strong>' +
                            '<ul>' +
                                data.stats.map(function(stat) {
                                    return '<li>• ' + stat._id + ': ' + stat.count + ' productos</li>';
                                }).join('') +
                            '</ul>' +
                        '</div>' +
                        '<p class="small-text">Completado: ' + new Date(data.timestamp).toLocaleString() + '</p>' +
                    '</div>';
                resultDiv.className = 'result result-success';
                
                setTimeout(checkStatus, 2000);
            })
            .catch(function(error) {
                resultDiv.innerHTML = '<h3><strong>❌ Error en actualización</strong></h3><p>' + error.message + '</p>';
                resultDiv.className = 'result result-error';
            });
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('check-btn').addEventListener('click', checkStatus);
            document.getElementById('update-btn').addEventListener('click', updateProducts);
            checkStatus();
        });
    </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;