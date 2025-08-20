const mongoose = require('mongoose');
const Category = require('./models/Category');

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const categoriasPredeterminadas = [
  {
    nombre: 'Hogar y Decoración',
    descripcion: 'Productos para el hogar, decoración, muebles y accesorios',
    icono: 'home',
    color: '#059669',
    estado: 'activa',
    orden: 1,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Hogar y Decoración - Productos para tu casa',
      descripcion: 'Encuentra los mejores productos para decorar y equipar tu hogar',
      palabrasClave: ['hogar', 'decoración', 'muebles', 'casa']
    }
  },
  {
    nombre: 'Cocina y Comedor',
    descripcion: 'Utensilios de cocina, electrodomésticos y productos para el comedor',
    icono: 'chef-hat',
    color: '#DC2626',
    estado: 'activa',
    orden: 2,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Cocina y Comedor - Utensilios y Electrodomésticos',
      descripcion: 'Todo lo que necesitas para equipar tu cocina y comedor',
      palabrasClave: ['cocina', 'utensilios', 'electrodomésticos', 'comedor']
    }
  },
  {
    nombre: 'Infantil y Bebés',
    descripcion: 'Productos para bebés, niños, juguetes y artículos infantiles',
    icono: 'baby',
    color: '#7C3AED',
    estado: 'activa',
    orden: 3,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Infantil y Bebés - Productos para niños',
      descripcion: 'Productos seguros y de calidad para bebés y niños',
      palabrasClave: ['bebés', 'infantil', 'juguetes', 'niños']
    }
  },
  {
    nombre: 'Aseo y Cuidado Personal',
    descripcion: 'Productos de higiene personal, cuidado corporal y aseo',
    icono: 'heart',
    color: '#EC4899',
    estado: 'activa',
    orden: 4,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Aseo y Cuidado Personal - Productos de higiene',
      descripcion: 'Productos de calidad para tu cuidado personal e higiene',
      palabrasClave: ['aseo', 'higiene', 'cuidado personal', 'belleza']
    }
  },
  {
    nombre: 'Manufactura y Herramientas',
    descripcion: 'Herramientas, materiales de construcción y productos industriales',
    icono: 'wrench',
    color: '#F59E0B',
    estado: 'activa',
    orden: 5,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Manufactura y Herramientas - Equipos profesionales',
      descripción: 'Herramientas y materiales para profesionales y aficionados',
      palabrasClave: ['herramientas', 'construcción', 'manufactura', 'industrial']
    }
  },
  {
    nombre: 'Tecnología y Electrónicos',
    descripcion: 'Dispositivos electrónicos, accesorios tecnológicos y gadgets',
    icono: 'smartphone',
    color: '#3B82F6',
    estado: 'activa',
    orden: 6,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Tecnología y Electrónicos - Dispositivos modernos',
      descripcion: 'Los mejores dispositivos y accesorios tecnológicos',
      palabrasClave: ['tecnología', 'electrónicos', 'smartphones', 'gadgets']
    }
  },
  {
    nombre: 'Ropa y Accesorios',
    descripcion: 'Vestimenta, calzado y accesorios de moda para toda la familia',
    icono: 'shirt',
    color: '#8B5CF6',
    estado: 'activa',
    orden: 7,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Ropa y Accesorios - Moda y estilo',
      descripcion: 'Encuentra la mejor ropa y accesorios de moda',
      palabrasClave: ['ropa', 'moda', 'accesorios', 'calzado']
    }
  },
  {
    nombre: 'Deportes y Recreación',
    descripcion: 'Artículos deportivos, equipos de ejercicio y productos recreativos',
    icono: 'football',
    color: '#10B981',
    estado: 'activa',
    orden: 8,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Deportes y Recreación - Vida activa',
      descripcion: 'Todo para mantenerte activo y disfrutar el deporte',
      palabrasClave: ['deportes', 'ejercicio', 'fitness', 'recreación']
    }
  },
  {
    nombre: 'Mascotas',
    descripcion: 'Productos para el cuidado, alimentación y entretenimiento de mascotas',
    icono: 'dog',
    color: '#F97316',
    estado: 'activa',
    orden: 9,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Mascotas - Cuidado animal',
      descripcion: 'Todo lo que tu mascota necesita para estar feliz y saludable',
      palabrasClave: ['mascotas', 'animales', 'perros', 'gatos']
    }
  },
  {
    nombre: 'Alimentación y Bebidas',
    descripcion: 'Productos alimenticios, bebidas y artículos gastronómicos',
    icono: 'utensils',
    color: '#EF4444',
    estado: 'activa',
    orden: 10,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Alimentación y Bebidas - Productos frescos',
      descripcion: 'Alimentos frescos y bebidas de calidad',
      palabrasClave: ['alimentos', 'bebidas', 'comida', 'gastronomía']
    }
  },
  {
    nombre: 'Limpieza del Hogar',
    descripcion: 'Productos de limpieza doméstica, detergentes, desinfectantes y artículos de aseo del hogar',
    icono: 'sparkles',
    color: '#06B6D4',
    estado: 'activa',
    orden: 11,
    destacada: true,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Limpieza del Hogar - Productos de limpieza',
      descripcion: 'Todo lo que necesitas para mantener tu hogar limpio y desinfectado',
      palabrasClave: ['limpieza', 'detergentes', 'desinfectantes', 'hogar', 'aseo doméstico']
    }
  },
  {
    nombre: 'Jardinería y Plantas',
    descripcion: 'Plantas, herramientas de jardinería, macetas y productos para el cuidado del jardín',
    icono: 'leaf',
    color: '#16A34A',
    estado: 'activa',
    orden: 12,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Jardinería y Plantas - Cultiva tu pasión',
      descripcion: 'Todo para crear y mantener hermosos jardines y espacios verdes',
      palabrasClave: ['jardinería', 'plantas', 'jardín', 'macetas', 'verde']
    }
  },
  {
    nombre: 'Oficina y Papelería',
    descripcion: 'Artículos de oficina, papelería, material escolar y suministros para el trabajo',
    icono: 'briefcase',
    color: '#6366F1',
    estado: 'activa',
    orden: 13,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Oficina y Papelería - Suministros profesionales',
      descripcion: 'Todo lo necesario para tu oficina, estudio y trabajo',
      palabrasClave: ['oficina', 'papelería', 'trabajo', 'escolar', 'suministros']
    }
  },
  {
    nombre: 'Automóviles y Motocicletas',
    descripcion: 'Accesorios para vehículos, repuestos, herramientas automotrices y productos de mantenimiento',
    icono: 'car',
    color: '#DC2626',
    estado: 'activa',
    orden: 14,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Automóviles y Motocicletas - Accesorios vehiculares',
      descripcion: 'Accesorios, repuestos y productos para el cuidado de tu vehículo',
      palabrasClave: ['automóviles', 'motocicletas', 'accesorios', 'repuestos', 'vehículos']
    }
  },
  {
    nombre: 'Salud y Bienestar',
    descripcion: 'Productos para el cuidado de la salud, vitaminas, suplementos y bienestar general',
    icono: 'heart-pulse',
    color: '#059669',
    estado: 'activa',
    orden: 15,
    destacada: false,
    mostrarEnMenu: true,
    seo: {
      titulo: 'Salud y Bienestar - Cuida tu salud',
      descripcion: 'Productos naturales y suplementos para tu salud y bienestar',
      palabrasClave: ['salud', 'bienestar', 'vitaminas', 'suplementos', 'natural']
    }
  }
];

async function crearCategorias() {
  try {
    console.log('🔄 Iniciando creación de categorías...');
    
    // Verificar si ya existen categorías
    const categoriasExistentes = await Category.countDocuments();
    
    if (categoriasExistentes > 0) {
      console.log(`⚠️  Ya existen ${categoriasExistentes} categorías en la base de datos.`);
      console.log('❓ ¿Deseas continuar y agregar solo las nuevas categorías? (Ctrl+C para cancelar)');
      
      // Esperar 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    let categoriasCreadas = 0;
    let categoriasExistentesCount = 0;
    
    for (const categoriaData of categoriasPredeterminadas) {
      try {
        // Verificar si la categoría ya existe
        const categoriaExistente = await Category.findOne({ 
          nombre: categoriaData.nombre 
        });
        
        if (categoriaExistente) {
          console.log(`⚪ Ya existe: ${categoriaData.nombre}`);
          categoriasExistentesCount++;
          continue;
        }
        
        // Crear nueva categoría
        const nuevaCategoria = new Category(categoriaData);
        await nuevaCategoria.save();
        
        console.log(`✅ Creada: ${categoriaData.nombre}`);
        categoriasCreadas++;
        
      } catch (error) {
        console.error(`❌ Error creando ${categoriaData.nombre}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen:');
    console.log(`✅ Categorías creadas: ${categoriasCreadas}`);
    console.log(`⚪ Categorías existentes: ${categoriasExistentesCount}`);
    console.log(`📋 Total en el sistema: ${await Category.countDocuments()}`);
    
    // Mostrar categorías activas
    const categoriasActivas = await Category.find({ estado: 'activa' })
      .sort({ orden: 1 })
      .select('nombre estado orden destacada');
    
    console.log('\n📌 Categorías activas:');
    categoriasActivas.forEach(cat => {
      const estrella = cat.destacada ? '⭐' : '  ';
      console.log(`${estrella} ${cat.orden}. ${cat.nombre}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
crearCategorias(); 