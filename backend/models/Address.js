const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  // Usuario propietario de la dirección
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  
  // Información básica de la dirección
  alias: {
    type: String,
    required: [true, 'El alias es requerido'],
    maxlength: [50, 'El alias no puede exceder 50 caracteres'],
    trim: true
  },
  
  // Información del destinatario
  nombreDestinatario: {
    type: String,
    required: [true, 'El nombre del destinatario es requerido'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    trim: true
  },
  
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    match: [/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'],
    minlength: [7, 'El teléfono debe tener al menos 7 dígitos']
  },
  
  // Dirección física
  direccion: {
    calle: {
      type: String,
      required: [true, 'La dirección es requerida'],
      maxlength: [200, 'La dirección no puede exceder 200 caracteres'],
      trim: true
    },
    
    numero: {
      type: String,
      maxlength: [20, 'El número no puede exceder 20 caracteres'],
      trim: true
    },
    
    apartamento: {
      type: String,
      maxlength: [20, 'El apartamento/oficina no puede exceder 20 caracteres'],
      trim: true
    },
    
    barrio: {
      type: String,
      required: [true, 'El barrio es requerido'],
      maxlength: [100, 'El barrio no puede exceder 100 caracteres'],
      trim: true
    },
    
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres'],
      trim: true
    },
    
    departamento: {
      type: String,
      required: [true, 'El departamento es requerido'],
      maxlength: [100, 'El departamento no puede exceder 100 caracteres'],
      trim: true
    },
    
    codigoPostal: {
      type: String,
      maxlength: [10, 'El código postal no puede exceder 10 caracteres'],
      trim: true
    },
    
    pais: {
      type: String,
      default: 'Colombia',
      maxlength: [50, 'El país no puede exceder 50 caracteres']
    }
  },
  
  // Coordenadas geográficas (opcional para futuras funcionalidades)
  coordenadas: {
    latitud: {
      type: Number,
      min: [-90, 'La latitud debe estar entre -90 y 90'],
      max: [90, 'La latitud debe estar entre -90 y 90']
    },
    
    longitud: {
      type: Number,
      min: [-180, 'La longitud debe estar entre -180 y 180'],
      max: [180, 'La longitud debe estar entre -180 y 180']
    }
  },
  
  // Configuraciones de la dirección
  configuracion: {
    esPredeterminada: {
      type: Boolean,
      default: false
    },
    
    esFacturacion: {
      type: Boolean,
      default: false
    },
    
    esEnvio: {
      type: Boolean,
      default: true
    },
    
    activa: {
      type: Boolean,
      default: true
    }
  },
  
  // Información adicional
  instruccionesEntrega: {
    type: String,
    maxlength: [500, 'Las instrucciones no pueden exceder 500 caracteres'],
    trim: true
  },
  
  // Tipo de dirección
  tipo: {
    type: String,
    enum: ['casa', 'apartamento', 'oficina', 'otro'],
    default: 'casa'
  },
  
  // Horarios de entrega preferidos
  horariosEntrega: {
    lunes: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    martes: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    miercoles: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    jueves: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    viernes: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    sabado: { inicio: String, fin: String, disponible: { type: Boolean, default: true } },
    domingo: { inicio: String, fin: String, disponible: { type: Boolean, default: false } }
  },
  
  // Metadatos
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  
  // Estadísticas de uso
  estadisticas: {
    vecesUsada: {
      type: Number,
      default: 0
    },
    
    ultimoUso: {
      type: Date
    },
    
    entregasExitosas: {
      type: Number,
      default: 0
    },
    
    entregasFallidas: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ocultar información sensible en las respuestas JSON si es necesario
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Índices
addressSchema.index({ usuario: 1 });
addressSchema.index({ usuario: 1, 'configuracion.esPredeterminada': 1 });
addressSchema.index({ 'direccion.ciudad': 1 });
addressSchema.index({ 'direccion.departamento': 1 });

// Virtual para obtener dirección completa formateada
addressSchema.virtual('direccionCompleta').get(function() {
  let direccion = this.direccion.calle;
  
  if (this.direccion.numero) {
    direccion += ` #${this.direccion.numero}`;
  }
  
  if (this.direccion.apartamento) {
    direccion += ` Apt/Ofc ${this.direccion.apartamento}`;
  }
  
  direccion += `, ${this.direccion.barrio}, ${this.direccion.ciudad}, ${this.direccion.departamento}`;
  
  if (this.direccion.codigoPostal) {
    direccion += ` ${this.direccion.codigoPostal}`;
  }
  
  return direccion;
});

// Virtual para información del destinatario completa
addressSchema.virtual('destinatarioCompleto').get(function() {
  return `${this.nombreDestinatario} - ${this.telefono}`;
});

// Middleware pre-save
addressSchema.pre('save', async function(next) {
  this.fechaActualizacion = new Date();
  
  // Si se marca como predeterminada, quitar el flag de las otras direcciones del mismo usuario
  if (this.configuracion.esPredeterminada && this.isModified('configuracion.esPredeterminada')) {
    await this.constructor.updateMany(
      { 
        usuario: this.usuario, 
        _id: { $ne: this._id },
        'configuracion.esPredeterminada': true 
      },
      { 
        $set: { 'configuracion.esPredeterminada': false } 
      }
    );
  }
  
  next();
});

// Middleware pre-remove para evitar eliminar la dirección predeterminada si es la única
addressSchema.pre('remove', async function(next) {
  const totalDirecciones = await this.constructor.countDocuments({ usuario: this.usuario });
  
  if (totalDirecciones === 1) {
    const error = new Error('No puedes eliminar tu única dirección');
    error.statusCode = 400;
    return next(error);
  }
  
  // Si se elimina la dirección predeterminada, marcar otra como predeterminada
  if (this.configuracion.esPredeterminada) {
    const otraDireccion = await this.constructor.findOne({ 
      usuario: this.usuario, 
      _id: { $ne: this._id },
      'configuracion.activa': true 
    });
    
    if (otraDireccion) {
      otraDireccion.configuracion.esPredeterminada = true;
      await otraDireccion.save();
    }
  }
  
  next();
});

// Método para marcar como usada
addressSchema.methods.marcarComoUsada = function() {
  this.estadisticas.vecesUsada += 1;
  this.estadisticas.ultimoUso = new Date();
  return this.save();
};

// Método para registrar entrega exitosa/fallida
addressSchema.methods.registrarEntrega = function(exitosa = true) {
  if (exitosa) {
    this.estadisticas.entregasExitosas += 1;
  } else {
    this.estadisticas.entregasFallidas += 1;
  }
  return this.save();
};

// Método estático para obtener dirección predeterminada del usuario
addressSchema.statics.obtenerPredeterminada = function(usuarioId) {
  return this.findOne({ 
    usuario: usuarioId, 
    'configuracion.esPredeterminada': true,
    'configuracion.activa': true 
  });
};

// Método estático para obtener todas las direcciones activas del usuario
addressSchema.statics.obtenerTodasActivas = function(usuarioId) {
  return this.find({ 
    usuario: usuarioId, 
    'configuracion.activa': true 
  }).sort({ 'configuracion.esPredeterminada': -1, fechaActualizacion: -1 });
};

module.exports = mongoose.model('Address', addressSchema); 