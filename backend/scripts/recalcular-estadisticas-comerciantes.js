const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
require('dotenv').config();

// Conectar a MongoDB
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora-spg', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para recalcular estadísticas de un comerciante
const recalcularEstadisticasComerciante = async (comercianteId) => {
  try {
    // Obtener todos los productos del comerciante
    const productos = await Product.find({ comerciante: comercianteId }).select('_id');
    const productosIds = productos.map(p => p._id);

    if (productosIds.length === 0) {
      console.log(`⚠️  Comerciante ${comercianteId} no tiene productos`);
      return {
        totalReseñas: 0,
        calificacionPromedio: 0
      };
    }

    // Calcular estadísticas de todas las reseñas de los productos del comerciante
    const estadisticas = await Review.aggregate([
      { 
        $match: { 
          producto: { $in: productosIds },
          estado: 'aprobada'
        }
      },
      {
        $group: {
          _id: null,
          calificacionPromedio: { $avg: '$calificacion' },
          totalReseñas: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalReseñas: estadisticas[0]?.totalReseñas || 0,
      calificacionPromedio: estadisticas[0]?.calificacionPromedio 
        ? Math.round(estadisticas[0].calificacionPromedio * 10) / 10 
        : 0
    };

    // Actualizar comerciante
    await User.findByIdAndUpdate(comercianteId, {
      'estadisticasComerciante.calificacionPromedio': stats.calificacionPromedio,
      'estadisticasComerciante.totalReseñas': stats.totalReseñas
    });

    return stats;
  } catch (error) {
    console.error(`❌ Error recalculando estadísticas para comerciante ${comercianteId}:`, error);
    return null;
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando recálculo de estadísticas de comerciantes...\n');
  
  await conectarDB();

  try {
    // Obtener todos los comerciantes
    const comerciantes = await User.find({ rol: 'comerciante' }).select('_id nombre nombreEmpresa');
    
    console.log(`📊 Comerciantes encontrados: ${comerciantes.length}\n`);

    let procesados = 0;
    let conReseñas = 0;
    let sinReseñas = 0;

    for (const comerciante of comerciantes) {
      const nombreMostrar = comerciante.nombreEmpresa || comerciante.nombre;
      process.stdout.write(`Procesando ${++procesados}/${comerciantes.length}: ${nombreMostrar}... `);
      
      const stats = await recalcularEstadisticasComerciante(comerciante._id);
      
      if (stats) {
        if (stats.totalReseñas > 0) {
          console.log(`✅ ${stats.totalReseñas} reseñas, promedio: ${stats.calificacionPromedio}⭐`);
          conReseñas++;
        } else {
          console.log(`⚪ Sin reseñas`);
          sinReseñas++;
        }
      } else {
        console.log(`❌ Error`);
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`  Total comerciantes: ${comerciantes.length}`);
    console.log(`  Con reseñas: ${conReseñas}`);
    console.log(`  Sin reseñas: ${sinReseñas}`);
    console.log('\n✅ Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar
main();
