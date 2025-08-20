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

const corregirRutasImagenes = async () => {
  try {
    console.log('🔄 Iniciando corrección de rutas de imágenes...');
    
    // Buscar todos los productos
    const productos = await Product.find({});
    console.log(`📊 Encontrados ${productos.length} productos`);
    
    let productosCorregidos = 0;
    let productosSinCambios = 0;
    
    for (const producto of productos) {
      let necesitaActualizacion = false;
      
      if (producto.imagenes && Array.isArray(producto.imagenes)) {
        // Procesar cada imagen
        for (let i = 0; i < producto.imagenes.length; i++) {
          const imagen = producto.imagenes[i];
          
          if (typeof imagen === 'string') {
            // Convertir string a objeto
            let urlCorregida = imagen;
            
            // Corregir rutas absolutas de Windows
            if (imagen.includes('C:\\') || imagen.includes('C:/')) {
              const pathParts = imagen.split('uploads');
              if (pathParts.length > 1) {
                urlCorregida = `/uploads${pathParts[1]}`;
              } else {
                urlCorregida = `/uploads/productos/${imagen.split('/').pop()}`;
              }
            }
            
            // Corregir barras invertidas de Windows
            urlCorregida = urlCorregida.replace(/\\/g, '/');
            
            // Convertir a objeto
            producto.imagenes[i] = {
              url: urlCorregida,
              publicId: null,
              alt: `${producto.nombre} - Imagen ${i + 1}`,
              orden: i
            };
            
            necesitaActualizacion = true;
            console.log(`   🔧 Corregida imagen ${i + 1}: ${imagen} → ${urlCorregida}`);
            
          } else if (imagen && typeof imagen === 'object' && imagen.url) {
            // Corregir URL si es necesario
            let urlCorregida = imagen.url;
            
            // Corregir rutas absolutas de Windows
            if (imagen.url.includes('C:\\') || imagen.url.includes('C:/')) {
              const pathParts = imagen.url.split('uploads');
              if (pathParts.length > 1) {
                urlCorregida = `/uploads${pathParts[1]}`;
              } else {
                urlCorregida = `/uploads/productos/${imagen.url.split('/').pop()}`;
              }
            }
            
            // Corregir barras invertidas de Windows
            urlCorregida = urlCorregida.replace(/\\/g, '/');
            
            if (urlCorregida !== imagen.url) {
              producto.imagenes[i].url = urlCorregida;
              necesitaActualizacion = true;
              console.log(`   🔧 Corregida imagen ${i + 1}: ${imagen.url} → ${urlCorregida}`);
            }
          }
        }
      }
      
      if (necesitaActualizacion) {
        await producto.save();
        productosCorregidos++;
        console.log(`✅ Producto "${producto.nombre}" actualizado`);
      } else {
        productosSinCambios++;
      }
    }
    
    console.log('\n📊 Resumen de correcciones:');
    console.log(`   ✅ Productos corregidos: ${productosCorregidos}`);
    console.log(`   ⏭️ Productos sin cambios: ${productosSinCambios}`);
    console.log(`   📦 Total de productos: ${productos.length}`);
    
    // Mostrar algunos ejemplos de productos corregidos
    if (productosCorregidos > 0) {
      console.log('\n🔍 Ejemplos de productos corregidos:');
      const productosEjemplo = await Product.find({}).limit(3);
      productosEjemplo.forEach(producto => {
        console.log(`   📦 ${producto.nombre}:`);
        if (producto.imagenes && producto.imagenes.length > 0) {
          producto.imagenes.forEach((img, index) => {
            const url = typeof img === 'string' ? img : img.url;
            console.log(`      🖼️ Imagen ${index + 1}: ${url}`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
};

const main = async () => {
  await connectDB();
  await corregirRutasImagenes();
  await mongoose.disconnect();
  console.log('\n🎉 Proceso completado');
};

main().catch(console.error); 