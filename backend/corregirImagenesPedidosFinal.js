const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const corregirImagenesPedidos = async () => {
  try {
    await connectDB();
    
    // Obtener modelo de Order
    const Order = require('./models/Order');
    
    console.log('🔍 Buscando pedidos con imágenes que tienen backslashes...');
    
    // Buscar todos los pedidos
    const pedidos = await Order.find({
      'productos.imagen': { $regex: /\\/ }
    });
    
    console.log(`📦 Encontrados ${pedidos.length} pedidos con rutas incorrectas`);
    
    let corregidos = 0;
    
    for (let pedido of pedidos) {
      let necesitaActualizacion = false;
      
      // Corregir cada producto
      pedido.productos.forEach(producto => {
        if (producto.imagen && producto.imagen.includes('\\')) {
          console.log(`  📸 Corrigiendo imagen: ${producto.imagen}`);
          producto.imagen = producto.imagen.replace(/\\/g, '/');
          necesitaActualizacion = true;
        }
      });
      
      if (necesitaActualizacion) {
        await pedido.save();
        corregidos++;
        console.log(`✅ Pedido ${pedido.numeroOrden} corregido`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se corrigieron ${corregidos} pedidos`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

corregirImagenesPedidos();
