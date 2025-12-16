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

const checkProductImages = async () => {
  try {
    console.log('🔍 Verificando imágenes de productos...\n');
    
    // Obtener algunos productos para verificar
    const products = await Product.find({}).limit(10).select('nombre imagenes estado');
    
    console.log(`📊 Productos encontrados: ${products.length}\n`);
    
    products.forEach((product, index) => {
      console.log(`--- Producto ${index + 1}: ${product.nombre} ---`);
      console.log(`Estado: ${product.estado}`);
      console.log(`Imágenes (${Array.isArray(product.imagenes) ? product.imagenes.length : 'no es array'}):`);
      
      if (Array.isArray(product.imagenes)) {
        product.imagenes.forEach((img, imgIndex) => {
          console.log(`  [${imgIndex}] Tipo: ${typeof img}, Valor:`, img);
        });
      } else {
        console.log(`  No es un array:`, product.imagenes);
      }
      console.log('');
    });
    
    // Estadísticas generales
    const totalProducts = await Product.countDocuments({});
    const productsWithImages = await Product.countDocuments({
      imagenes: { $exists: true, $not: { $size: 0 } }
    });
    const productsWithoutImages = totalProducts - productsWithImages;
    
    console.log('📈 Estadísticas generales:');
    console.log(`Total de productos: ${totalProducts}`);
    console.log(`Productos con imágenes: ${productsWithImages}`);
    console.log(`Productos sin imágenes: ${productsWithoutImages}`);
    
  } catch (error) {
    console.error('❌ Error verificando imágenes:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkProductImages();
  
  process.exit(0);
};

main();