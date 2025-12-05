const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: function() {
      // Solo requerida si no es autenticación social
      return !this.proveedor || this.proveedor === 'local';
    },
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^[\+]?[\d\s\-\(\)]{10,15}$/, 'Número de teléfono inválido']
  },
  
  // Campos para autenticación social
  proveedor: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  proveedorId: {
    type: String,
    sparse: true // Permite múltiples documentos con null
  },
  fotoPerfilSocial: {
    type: String,
    default: null
  },
  rol: {
    type: String,
    enum: ['cliente', 'comerciante', 'administrador'],
    default: 'cliente'
  },
  nombreEmpresa: {
    type: String,
    trim: true,
    maxlength: [100, 'El nombre de la empresa no puede exceder 100 caracteres']
  },
  avatar: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'bloqueado'],
    default: 'activo'
  },
  verificado: {
    type: Boolean,
    default: false
  },
  
  // Configuración de usuario
  configuracion: {
    pais: {
      type: String,
      default: 'Colombia'
    },
    region: {
      type: String,
      default: ''
    },
    idioma: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    moneda: {
      type: String,
      default: 'COP'
    }
  },

  // Dirección de envío
  direccion: {
    calle: String,
    ciudad: String,
    departamento: String,
    codigoPostal: String,
    pais: {
      type: String,
      default: 'Colombia'
    }
  },

  // Métodos de pago guardados
  metodosPago: [{
    tipo: {
      type: String,
      enum: ['PSE', 'Nequi', 'tarjeta_credito'],
      required: true
    },
    nombre: String,
    // Para PSE
    banco: String,
    // Para tarjeta
    ultimosCuatroDigitos: String,
    tipoTarjeta: String,
    // Para Nequi
    numeroNequi: String,
    fechaCreacion: {
      type: Date,
      default: Date.now
    }
  }],

  // Lista de favoritos (solo para clientes)
  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Historial de pedidos
  historialPedidos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],

  // Para comerciantes - estadísticas
  estadisticasComerciante: {
    totalVentas: {
      type: Number,
      default: 0
    },
    productosVendidos: {
      type: Number,
      default: 0
    },
    calificacionPromedio: {
      type: Number,
      default: 0
    },
    totalReseñas: {
      type: Number,
      default: 0
    }
  },

  // Tokens para verificación y recuperación
  tokenVerificacion: String,
  codigoVerificacion: String,
  codigoExpiracion: Date,
  fechaVerificacion: Date,
  tokenRecuperacion: String,
  fechaRecuperacion: Date,
  
  // Fechas importantes
  fechaUltimoLogin: Date,
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento (email ya tiene índice único automático)
userSchema.index({ rol: 1 });
userSchema.index({ estado: 1 });
userSchema.index({ 'configuracion.pais': 1 });
// Índice para proveedores sociales (solo se crea cuando proveedorId existe)
userSchema.index({ proveedorId: 1 }, { unique: true, sparse: true });

// Middleware para hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // No hashear si no hay contraseña o no se ha modificado
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(passwordCandidato) {
  return await bcrypt.compare(passwordCandidato, this.password);
};

// Método para obtener datos del usuario sin información sensible
userSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.password;
  delete usuario.tokenVerificacion;
  delete usuario.tokenRecuperacion;
  return usuario;
};

// Virtual para el nombre completo
userSchema.virtual('nombreCompleto').get(function() {
  return this.nombre;
});

// Virtual para contar productos favoritos
userSchema.virtual('totalFavoritos').get(function() {
  return this.favoritos ? this.favoritos.length : 0;
});

// Middleware para actualizar fechaActualizacion
userSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema); 