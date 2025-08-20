const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function verificarDatos() {
  try {
    console.log('🔍 Verificando datos...');
    
    const usuarios = await User.find({});
    console.log(`👥 Total usuarios: ${usuarios.length}`);
    usuarios.forEach(u => console.log(`  - ${u.nombre} (${u.rol})`));
    
    const productos = await Product.find({});
    console.log(`📦 Total productos: ${productos.length}`);
    
    const pedidos = await Order.find({}).populate('cliente', 'nombre');
    console.log(`🛒 Total pedidos: ${pedidos.length}`);
    pedidos.forEach(p => console.log(`  - ${p.numeroOrden} - Cliente: ${p.cliente?.nombre || 'Sin cliente'}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

verificarDatos(); 