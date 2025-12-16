const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Importar modelo de productos
const Product = require('../models/Product');

const updatePendingProducts = async () => {
  try {
    console.log('🔄 Iniciando actualización de productos pendientes...');
    
    // Encontrar todos los productos con estado 'pendiente'
    const productsPending = await Product.find({ estado: 'pendiente' });
    console.log(`📋 Productos pendientes encontrados: ${productsPending.length}`);
    
    if (productsPending.length === 0) {
      console.log('✅ No hay productos pendientes para actualizar');
      return;
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
    
    // Verificar que no quedan productos pendientes
    const remainingPending = await Product.countDocuments({ estado: 'pendiente' });
    console.log(`📊 Productos pendientes restantes: ${remainingPending}`);
    
    // También actualizar productos con estado 'rechazado' si los hay
    const rejectedProducts = await Product.find({ estado: 'rechazado' });
    if (rejectedProducts.length > 0) {
      console.log(`📋 Productos rechazados encontrados: ${rejectedProducts.length}`);
      
      const rejectedResult = await Product.updateMany(
        { estado: 'rechazado' },
        { 
          $set: { 
            estado: 'aprobado',
            fechaActualizacion: new Date()
          }
        }
      );
      
      console.log(`✅ Productos rechazados actualizados: ${rejectedResult.modifiedCount}`);
    }
    
    // Mostrar estadísticas finales
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📊 Estadísticas de productos por estado:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} productos`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
  }
};

const main = async () => {
  await connectDB();
  await updatePendingProducts();
  
  console.log('🎉 Actualización completada');
  process.exit(0);
};

main();