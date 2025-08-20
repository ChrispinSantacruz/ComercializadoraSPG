const mongoose = require('mongoose');
const Product = require('./models/Product');
const path = require('path');

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

const corregirRutasImagenes = async () => {
  try {
    console.log('🔄 Iniciando corrección de rutas de imágenes...');
    
    // Buscar productos que tienen imágenes
    const productos = await Product.find({
      imagenes: { $exists: true, $ne: [] }
    });

    console.log(`📦 Encontrados ${productos.length} productos con imágenes`);

    let corregidos = 0;
    let sinCambios = 0;

    for (const producto of productos) {
      let necesitaCorreccion = false;
      let nuevasImagenes = [];

      if (Array.isArray(producto.imagenes)) {
        for (let i = 0; i < producto.imagenes.length; i++) {
          const imagen = producto.imagenes[i];
          let nuevaUrl = '';
          
          if (typeof imagen === 'string') {
            // Es un string, verificar si tiene ruta completa
            if (imagen.includes('C:\\') || imagen.includes('C:/') || imagen.includes('uploads/uploads')) {
              // Extraer solo la parte después de 'uploads'
              const pathParts = imagen.split('uploads');
              if (pathParts.length > 1) {
                nuevaUrl = `/uploads${pathParts[1]}`;
              } else {
                nuevaUrl = `/uploads/productos/${path.basename(imagen)}`;
              }
              necesitaCorreccion = true;
            } else {
              nuevaUrl = imagen;
            }
            
            nuevasImagenes.push({
              url: nuevaUrl,
              publicId: null,
              alt: `${producto.nombre} - Imagen ${i + 1}`,
              orden: i
            });
          } else if (typeof imagen === 'object' && imagen.url) {
            // Es un objeto, verificar la URL
            if (imagen.url.includes('C:\\') || imagen.url.includes('C:/') || imagen.url.includes('uploads/uploads')) {
              const pathParts = imagen.url.split('uploads');
              if (pathParts.length > 1) {
                nuevaUrl = `/uploads${pathParts[1]}`;
              } else {
                nuevaUrl = `/uploads/productos/${path.basename(imagen.url)}`;
              }
              necesitaCorreccion = true;
              
              nuevasImagenes.push({
                url: nuevaUrl,
                publicId: imagen.publicId || null,
                alt: imagen.alt || `${producto.nombre} - Imagen ${i + 1}`,
                orden: imagen.orden || i
              });
            } else {
              nuevasImagenes.push(imagen);
            }
          }
        }
      }

      if (necesitaCorreccion) {
        // Actualizar el producto
        await Product.findByIdAndUpdate(producto._id, {
          $set: {
            imagenes: nuevasImagenes,
            imagenPrincipal: nuevasImagenes.length > 0 ? nuevasImagenes[0].url : null
          }
        });
        
        console.log(`✅ Corregido: ${producto.nombre}`);
        console.log(`   Antes: ${producto.imagenes[0]?.url || producto.imagenes[0]}`);
        console.log(`   Después: ${nuevasImagenes[0]?.url}`);
        corregidos++;
      } else {
        console.log(`⏭️ Sin cambios: ${producto.nombre}`);
        sinCambios++;
      }
    }

    console.log('\n📊 RESUMEN DE CORRECCIÓN:');
    console.log(`✅ Productos corregidos: ${corregidos}`);
    console.log(`⏭️ Productos sin cambios: ${sinCambios}`);
    console.log(`📦 Total procesados: ${productos.length}`);

    // Mostrar algunos ejemplos de productos corregidos
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
    console.error('❌ Error durante la corrección:', error);
  }
};

const main = async () => {
  await connectDB();
  await corregirRutasImagenes();
  await mongoose.disconnect();
  console.log('\n🎉 Corrección completada');
};

main().catch(console.error); 