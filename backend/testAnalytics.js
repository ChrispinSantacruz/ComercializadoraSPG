const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg';

const testAnalytics = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar un comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró ningún comerciante');
      return;
    }
    console.log(`👤 Comerciante encontrado: ${comerciante.nombre} (${comerciante._id})`);

    // Verificar productos del comerciante
    const productos = await Product.find({ comerciante: comerciante._id });
    console.log(`📦 Productos del comerciante: ${productos.length}`);

    // Verificar pedidos que incluyen productos del comerciante
    const pedidos = await Order.find({
      'productos.comerciante': comerciante._id
    }).populate('cliente', 'nombre email');
    console.log(`📋 Pedidos del comerciante: ${pedidos.length}`);

    // Mostrar detalles de los pedidos
    pedidos.forEach((pedido, index) => {
      console.log(`\n📋 Pedido ${index + 1}:`);
      console.log(`   ID: ${pedido._id}`);
      console.log(`   Estado: ${pedido.estado}`);
      console.log(`   Total: $${pedido.total}`);
      console.log(`   Fecha: ${pedido.fechaCreacion}`);
      console.log(`   Cliente: ${pedido.cliente?.nombre || 'N/A'}`);
      
      const productosComerciante = pedido.productos.filter(p => 
        p.comerciante.toString() === comerciante._id.toString()
      );
      console.log(`   Productos del comerciante: ${productosComerciante.length}`);
      productosComerciante.forEach((item, i) => {
        console.log(`     ${i + 1}. ${item.producto?.nombre || 'Producto N/A'} - Cantidad: ${item.cantidad} - Subtotal: $${item.subtotal}`);
      });
    });

    // Verificar reseñas de productos del comerciante
    const productosIds = productos.map(p => p._id);
    const reseñas = await Review.find({
      producto: { $in: productosIds },
      estado: 'aprobada'
    }).populate('usuario', 'nombre');
    console.log(`\n⭐ Reseñas de productos del comerciante: ${reseñas.length}`);

    // Calcular estadísticas básicas
    const totalIngresos = pedidos.reduce((sum, order) => {
      const productosComerciante = order.productos.filter(p => 
        p.comerciante.toString() === comerciante._id.toString()
      );
      return sum + productosComerciante.reduce((sumP, p) => sumP + p.subtotal, 0);
    }, 0);

    const pedidosEnTransito = pedidos.filter(order => 
      ['pendiente', 'confirmado', 'enviado'].includes(order.estado)
    ).length;

    const productosAgotados = productos.filter(p => p.stock === 0).length;

    console.log('\n📊 Estadísticas Calculadas:');
    console.log(`   Total Ingresos: $${totalIngresos}`);
    console.log(`   Pedidos en Tránsito: ${pedidosEnTransito}`);
    console.log(`   Productos Agotados: ${productosAgotados}`);
    console.log(`   Total Productos: ${productos.length}`);

    // Simular llamada a la API
    console.log('\n🧪 Simulando llamada a la API de analytics...');
    
    // Crear un request simulado
    const request = {
      usuario: { id: comerciante._id.toString() },
      query: { periodo: '30d' }
    };

    const response = {
      json: (data) => {
        console.log('✅ Respuesta de la API:');
        console.log(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`);
          console.log(JSON.stringify(data, null, 2));
        }
      })
    };

    // Importar y ejecutar el controlador
    const { obtenerAnalyticsComerciante } = require('./controllers/analyticsController');
    await obtenerAnalyticsComerciante(request, response);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

testAnalytics(); 