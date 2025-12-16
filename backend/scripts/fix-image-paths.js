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

const fixImagePaths = async () => {
  try {
    console.log('🔧 Corrigiendo rutas de imágenes...\n');
    
    // Obtener todos los productos con imágenes
    const products = await Product.find({
      imagenes: { $exists: true, $not: { $size: 0 } }
    });
    
    console.log(`📊 Productos con imágenes encontrados: ${products.length}\n`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      const updatedImages = [];
      
      for (const image of product.imagenes) {
        if (typeof image === 'object' && image.url) {
          // Corregir backslashes a forward slashes
          const correctedUrl = image.url.replace(/\\/g, '/');
          
          if (correctedUrl !== image.url) {
            console.log(`📝 Corrigiendo imagen en "${product.nombre}"`);
            console.log(`   Antes: ${image.url}`);
            console.log(`   Después: ${correctedUrl}`);
            needsUpdate = true;
          }
          
          updatedImages.push({
            ...image,
            url: correctedUrl
          });
        } else if (typeof image === 'string') {
          // Si es string, también corregir
          const correctedUrl = image.replace(/\\/g, '/');
          if (correctedUrl !== image) {
            console.log(`📝 Corrigiendo imagen string en "${product.nombre}"`);
            console.log(`   Antes: ${image}`);
            console.log(`   Después: ${correctedUrl}`);
            needsUpdate = true;
          }
          updatedImages.push(correctedUrl);
        } else {
          updatedImages.push(image);
        }
      }
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, {
          imagenes: updatedImages,
          fechaActualizacion: new Date()
        });
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Productos actualizados: ${updatedCount}`);
    
    // Verificar resultados
    console.log('\n🔍 Verificando resultados...');
    const updatedProducts = await Product.find({
      imagenes: { $exists: true, $not: { $size: 0 } }
    }).select('nombre imagenes').limit(5);
    
    updatedProducts.forEach((product, index) => {
      console.log(`\n--- Producto ${index + 1}: ${product.nombre} ---`);
      product.imagenes.forEach((img, imgIndex) => {
        if (typeof img === 'object' && img.url) {
          console.log(`  [${imgIndex}] URL: ${img.url}`);
        } else {
          console.log(`  [${imgIndex}] ${img}`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error corrigiendo imágenes:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixImagePaths();
  
  console.log('\n🎉 Corrección completada');
  process.exit(0);
};

main();