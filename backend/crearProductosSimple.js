const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

async function main() {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    // Verificar administrador
    let admin = await User.findOne({ email: 'chris@chrisadmin.com' });
    if (!admin) {
      console.log('👤 Creando administrador...');
      admin = new User({
        nombre: 'Chris Admin',
        email: 'chris@chrisadmin.com',
        password: 'Pipeman06',
        rol: 'administrador',
        estado: 'activo',
        verificado: true
      });
      await admin.save();
      console.log('✅ Administrador creado');
    } else {
      console.log('✅ Administrador existe');
    }

    // Buscar comerciante
    let comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('👤 Creando comerciante...');
      comerciante = new User({
        nombre: 'Comerciante Prueba',
        email: 'comerciante@prueba.com',
        password: '123456',
        rol: 'comerciante',
        estado: 'activo',
        verificado: true
      });
      await comerciante.save();
      console.log('✅ Comerciante creado');
    } else {
      console.log('✅ Comerciante encontrado');
    }

    // Buscar primera categoría disponible
    const categoria = await Category.findOne();
    if (!categoria) {
      console.log('❌ No hay categorías. Ejecuta seedCategories.js primero');
      return;
    }
    console.log(`📂 Usando categoría: ${categoria.nombre}`);

    // Crear productos básicos
    const productos = [
      {
        nombre: 'Samsung Galaxy A54',
        descripcion: 'Smartphone con pantalla de 6.4 pulgadas',
        precio: 850000,
        stock: 10,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        especificaciones: [{ nombre: 'Pantalla', valor: '6.4"' }],
        tags: ['smartphone']
      },
      {
        nombre: 'Laptop HP Pavilion',
        descripcion: 'Laptop con Intel Core i5',
        precio: 2450000,
        stock: 5,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        especificaciones: [{ nombre: 'Procesador', valor: 'Intel i5' }],
        tags: ['laptop']
      },
      {
        nombre: 'Smart TV LG 55"',
        descripcion: 'TV 4K con WebOS',
        precio: 1850000,
        stock: 3,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'aprobado', // Este estará aprobado
        especificaciones: [{ nombre: 'Tamaño', valor: '55"' }],
        tags: ['tv']
      }
    ];

    console.log('\n📦 Creando productos...');
    for (const prodData of productos) {
      const existe = await Product.findOne({ nombre: prodData.nombre });
      if (!existe) {
        const producto = new Product(prodData);
        await producto.save();
        console.log(`✅ ${producto.nombre} (${producto.estado})`);
      } else {
        console.log(`⏭️  ${prodData.nombre} ya existe`);
      }
    }

    // Mostrar resumen
    const total = await Product.countDocuments();
    const pendientes = await Product.countDocuments({ estado: 'pendiente' });
    const aprobados = await Product.countDocuments({ estado: 'aprobado' });

    console.log('\n📊 RESUMEN:');
    console.log(`📦 Total productos: ${total}`);
    console.log(`⏳ Pendientes: ${pendientes}`);
    console.log(`✅ Aprobados: ${aprobados}`);

    console.log('\n🎉 ¡LISTO! Ahora puedes:');
    console.log('1. Iniciar backend: npm start');
    console.log('2. Ir a: http://localhost:3000/admin/products');
    console.log('3. Login: chris@chrisadmin.com / Pipeman06');
    console.log('4. Aprobar productos pendientes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado');
  }
}

main(); 