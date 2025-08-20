const mongoose = require('mongoose');
const Product = require('./models/Product');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const migrarImagenes = async () => {
  try {
    console.log('🔄 Iniciando migración de imágenes...');
    
    // Buscar productos que tienen imágenes como strings
    const productos = await Product.find({
      $or: [
        { imagenes: { $exists: true, $type: 'array' } },
        { imagenes: { $exists: true, $type: 'string' } }
      ]
    });

    console.log(`📦 Encontrados ${productos.length} productos para migrar`);

    let migrados = 0;
    let sinCambios = 0;

    for (const producto of productos) {
      let necesitaMigracion = false;
      let nuevasImagenes = [];

      // Verificar si las imágenes están en formato string
      if (Array.isArray(producto.imagenes)) {
        for (let i = 0; i < producto.imagenes.length; i++) {
          const imagen = producto.imagenes[i];
          
          if (typeof imagen === 'string') {
            // Convertir string a objeto
            nuevasImagenes.push({
              url: imagen,
              publicId: null,
              alt: `${producto.nombre} - Imagen ${i + 1}`,
              orden: i
            });
            necesitaMigracion = true;
          } else if (typeof imagen === 'object' && imagen.url) {
            // Ya está en formato correcto
            nuevasImagenes.push(imagen);
          }
        }
      }

      if (necesitaMigracion) {
        // Actualizar el producto
        await Product.findByIdAndUpdate(producto._id, {
          $set: {
            imagenes: nuevasImagenes,
            imagenPrincipal: nuevasImagenes.length > 0 ? nuevasImagenes[0].url : null
          }
        });
        
        console.log(`✅ Migrado: ${producto.nombre} (${nuevasImagenes.length} imágenes)`);
        migrados++;
      } else {
        console.log(`⏭️ Sin cambios: ${producto.nombre}`);
        sinCambios++;
      }
    }

    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Productos migrados: ${migrados}`);
    console.log(`⏭️ Productos sin cambios: ${sinCambios}`);
    console.log(`📦 Total procesados: ${productos.length}`);

    // Mostrar algunos ejemplos de productos migrados
    const ejemplos = await Product.find({}).limit(3);
    console.log('\n🔍 Ejemplos de productos:');
    ejemplos.forEach(producto => {
      console.log(`\n📦 ${producto.nombre}:`);
      console.log(`   Estado: ${producto.estado}`);
      console.log(`   Imágenes: ${producto.imagenes.length}`);
      if (producto.imagenes.length > 0) {
        console.log(`   Primera imagen: ${producto.imagenes[0].url || producto.imagenes[0]}`);
      }
    });

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
};

const main = async () => {
  await connectDB();
  await migrarImagenes();
  await mongoose.disconnect();
  console.log('\n🎉 Migración completada');
};

main().catch(console.error); 