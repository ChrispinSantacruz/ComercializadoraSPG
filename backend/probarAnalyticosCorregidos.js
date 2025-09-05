const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Conectar a la base de datos
require('./config/database');

// Importar modelos
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Review = require('./models/Review');

async function probarAnalyticosCorregidos() {
  try {
    console.log('🔄 Probando cálculos analíticos corregidos...\n');

    // Buscar el comerciante existente
    const comerciante = await User.findOne({ tipo: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró comerciante');
      return;
    }

    console.log(`📊 Comerciante encontrado: ${comerciante.nombre} (${comerciante._id})`);

    // Verificar productos del comerciante
    const productos = await Product.find({ comerciante: comerciante._id });
    console.log(`📦 Productos del comerciante: ${productos.length}`);
    productos.forEach(p => {
      console.log(`   - ${p.nombre}: $${p.precio}`);
    });

    // Verificar pedidos con productos del comerciante
    const pedidos = await Order.find({ 'productos.comerciante': comerciante._id });
    console.log(`\n🛒 Pedidos con productos del comerciante: ${pedidos.length}`);
    
    let totalCalculadoManual = 0;
    pedidos.forEach(pedido => {
      console.log(`\n   Pedido ${pedido._id}:`);
      console.log(`   Estado: ${pedido.estado}`);
      console.log(`   Total del pedido: $${pedido.total}`);
      console.log(`   Productos:`);
      
      pedido.productos.forEach(prod => {
        if (prod.comerciante.toString() === comerciante._id.toString()) {
          const subtotal = prod.precio * prod.cantidad;
          totalCalculadoManual += subtotal;
          console.log(`     - ${prod.nombre}: $${prod.precio} x ${prod.cantidad} = $${subtotal}`);
        }
      });
    });

    console.log(`\n💰 Total calculado manualmente: $${totalCalculadoManual}`);

    // Simular el cálculo del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    console.log(`📅 Calculando desde inicio del mes: ${inicioMes.toLocaleDateString()}`);

    // Probar la agregación corregida
    const ventasDelMes = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comerciante._id,
          fechaCreacion: { $gte: inicioMes },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      {
        $match: {
          'productos.comerciante': comerciante._id
        }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } },
          totalProductos: { $sum: '$productos.cantidad' }
        }
      },
      {
        $addFields: {
          comisionComercio: { $multiply: ['$totalVentas', 0.85] }
        }
      }
    ]);

    console.log('\n📈 Resultado de agregación corregida:');
    console.log(JSON.stringify(ventasDelMes, null, 2));

    // Probar ventas por día
    const ventasPorDia = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comerciante._id,
          fechaCreacion: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      {
        $match: {
          'productos.comerciante': comerciante._id
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$fechaCreacion' }
          },
          ventas: { $sum: 1 },
          ingresos: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    console.log('\n📊 Ventas por día (últimos 30 días):');
    ventasPorDia.forEach(dia => {
      console.log(`   ${dia._id}: ${dia.ventas} ventas, $${dia.ingresos} ingresos`);
    });

    console.log('\n✅ Prueba de analíticos completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

probarAnalyticosCorregidos();
