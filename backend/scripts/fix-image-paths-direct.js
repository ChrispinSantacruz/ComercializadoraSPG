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

const fixImagePathsDirectly = async () => {
  try {
    console.log('🔧 Corrigiendo rutas de imágenes directamente...\n');
    
    // Usar agregación para actualizar todas las rutas con backslashes
    const result = await mongoose.connection.db.collection('products').updateMany(
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

    console.log(`✅ Productos actualizados: ${result.modifiedCount}`);

    // Verificar el resultado
    const Product = require('../models/Product');
    const products = await Product.find({}).select('nombre imagenes').limit(5);
    
    console.log('\n🔍 Verificando resultados finales:');
    products.forEach((product, index) => {
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
    console.log('Error details:', error.message);
  }
};

const main = async () => {
  await connectDB();
  await fixImagePathsDirectly();
  
  console.log('\n🎉 Corrección completada');
  process.exit(0);
};

main();