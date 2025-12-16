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

module.exports = router;