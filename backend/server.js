const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
// Configurar variables de entorno por defecto si no existen
require('dotenv').config();

// Variables por defecto si no hay archivo .env
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mi_secreto_jwt_comercializadora_2024';
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

// Importar configuración de base de datos
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commerceRoutes = require('./routes/commerceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const addressRoutes = require('./routes/addressRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const wompiRoutes = require('./routes/wompi');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

// Importar configuración de Passport
const passport = require('./config/passport');

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad
app.use(helmet());
app.use(compression());

// Rate limiting - Más permisivo para desarrollo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite de 1000 requests por ventana de tiempo (más permisivo)
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});
app.use('/api/', limiter);

// Middleware para manejar errores de rate limiting
app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      exito: false,
      mensaje: 'Demasiadas peticiones. Intenta de nuevo en unos minutos.',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }
  next(err);
});

// Middlewares generales
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configuración de CORS - Más permisiva para desarrollo
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://andinoexpress.com',
    'https://www.andinoexpress.com',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ].filter(Boolean), // Filtrar valores undefined
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware adicional para manejar CORS en rutas de archivos estáticos
app.use('/api/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware de logging específico para rutas importantes
app.use((req, res, next) => {
  if (req.url.includes('/wompi/') || req.url.includes('/auth/')) {
    console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📝 Body:', JSON.stringify(req.body, null, 2));
    }
    if (req.headers.authorization) {
      console.log('🔑 Auth header present');
    }
  }
  next();
});

// Configuración de Passport
app.use(passport.initialize());

// Servir archivos estáticos (imágenes subidas) - Configuración mejorada
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Configuración CORS más permisiva para archivos estáticos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Configurar cache para optimizar carga de imágenes
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 día
    }
  }
}));

// Ruta adicional para archivos estáticos sin prefijo /api
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Conectar a la base de datos
connectDB();

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Bienvenido a Comercializadora SPG API',
    version: '1.0.0',
    status: 'Activo',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      reviews: '/api/reviews',
      categories: '/api/categories',
      admin: '/api/admin',
      commerce: '/api/commerce',
      payments: '/api/payments',
      addresses: '/api/addresses'
    }
  });
});

// Ruta de prueba para verificar que las rutas de auth funcionan
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: '✅ Auth routes are working',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/reenviar-codigo',
      'POST /api/auth/verificar-codigo'
    ]
  });
});

// RUTA TEMPORAL PARA CREAR ADMINISTRADOR - SOLO POSTMAN (ELIMINAR DESPUÉS DE USAR)
// IMPORTANTE: Esta ruta debe ir ANTES de las rutas generales para evitar conflictos
const User = require('./models/User');
app.post('/api/admin/create-super-admin', async (req, res) => {
  try {
    console.log('🚀 Intentando crear/actualizar administrador via POST...');
    
    // Validar que el request tenga la clave secreta
    const { secretKey, adminData } = req.body;
    
    if (secretKey !== 'CREATE_ADMIN_SECRET_2025') {
      return res.status(401).json({
        success: false,
        message: '❌ Clave secreta incorrecta'
      });
    }
    
    // Usar datos del request o datos por defecto
    const email = adminData?.email || 'chris@chrisadmin.com';
    const password = adminData?.password || 'Pipeman06';
    const nombre = adminData?.nombre || 'Chris Admin';
    
    console.log(`📧 Creando admin con email: ${email}`);
    
    // Verificar si ya existe
    const existingAdmin = await User.findOne({ email: email });
    
    if (existingAdmin) {
      console.log('👤 Usuario existente encontrado, actualizando...');
      // Actualizar contraseña y rol
      existingAdmin.password = password;
      existingAdmin.rol = 'administrador';
      existingAdmin.estado = 'activo';
      existingAdmin.nombre = nombre;
      await existingAdmin.save();
      
      console.log('✅ Administrador actualizado');
      return res.json({
        success: true,
        message: '✅ Administrador actualizado exitosamente',
        admin: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          nombre: existingAdmin.nombre,
          rol: existingAdmin.rol,
          estado: existingAdmin.estado
        },
        loginInfo: {
          email: email,
          password: password,
          loginUrl: 'http://localhost:3000/login',
          adminPanel: 'http://localhost:3000/admin'
        }
      });
    }

    console.log('👤 Creando nuevo administrador...');
    // Crear nuevo administrador
    const newAdminData = {
      nombre: nombre,
      email: email,
      password: password,
      telefono: '+57 300 123 4567',
      rol: 'administrador',
      estado: 'activo',
      configuracion: {
        pais: 'Colombia',
        region: 'Bogotá',
        idioma: 'es',
        moneda: 'COP'
      },
      direccion: {
        calle: 'Calle Principal 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigoPostal: '110111',
        pais: 'Colombia'
      }
    };

    const admin = new User(newAdminData);
    await admin.save();
    
    console.log('✅ Administrador creado exitosamente');
    res.status(201).json({
      success: true,
      message: '✅ ¡Administrador creado exitosamente!',
      admin: {
        id: admin._id,
        email: admin.email,
        nombre: admin.nombre,
        rol: admin.rol,
        estado: admin.estado,
        fechaCreacion: admin.fechaCreacion
      },
      loginInfo: {
        email: email,
        password: password,
        loginUrl: 'http://localhost:3000/login',
        adminPanel: 'http://localhost:3000/admin'
      }
    });

  } catch (error) {
    console.error('❌ Error creando admin:', error);
    res.status(500).json({
      success: false,
      message: '❌ Error creando administrador',
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : null
    });
  }
});

// API Routes (después de la ruta temporal)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wompi', wompiRoutes);

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌟 Servidor de Comercializadora SPG ejecutándose en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📱 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Error no manejado:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 