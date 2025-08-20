const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Usuario que recibe la notificación
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  
  // Tipo de notificación
  tipo: {
    type: String,
    enum: [
      'producto_aprobado',
      'producto_rechazado',
      'nueva_venta',
      'pedido_confirmado',
      'pedido_enviado',
      'pedido_entregado',
      'pedido_cancelado',
      'nueva_reseña',
      'respuesta_reseña',
      'stock_bajo',
      'nuevo_mensaje',
      'promocion',
      'sistema'
    ],
    required: [true, 'El tipo de notificación es requerido']
  },
  
  // Título de la notificación
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  
  // Mensaje de la notificación
  mensaje: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    maxlength: [500, 'El mensaje no puede exceder 500 caracteres']
  },
  
  // Datos adicionales de la notificación
  datos: {
    // ID del elemento relacionado (producto, pedido, etc.)
    elementoId: mongoose.Schema.Types.ObjectId,
    
    // Tipo de elemento
    tipoElemento: {
      type: String,
      enum: ['producto', 'pedido', 'reseña', 'usuario', 'mensaje']
    },
    
    // Datos específicos según el tipo
    datosExtra: mongoose.Schema.Types.Mixed,
    
    // URL de redirección
    url: String,
    
    // Acción sugerida
    accion: String
  },
  
  // Estado de la notificación
  estado: {
    type: String,
    enum: ['no_leida', 'leida', 'archivada'],
    default: 'no_leida'
  },
  
  // Prioridad de la notificación
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  
  // Canales de notificación
  canales: {
    enApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Estado de envío por canal
  estadoEnvio: {
    enApp: {
      enviado: {
        type: Boolean,
        default: false
      },
      fechaEnvio: Date
    },
    email: {
      enviado: {
        type: Boolean,
        default: false
      },
      fechaEnvio: Date,
      error: String
    },
    sms: {
      enviado: {
        type: Boolean,
        default: false
      },
      fechaEnvio: Date,
      error: String
    },
    push: {
      enviado: {
        type: Boolean,
        default: false
      },
      fechaEnvio: Date,
      error: String
    }
  },
  
  // Información del remitente
  remitente: {
    tipo: {
      type: String,
      enum: ['sistema', 'usuario', 'automatico'],
      default: 'sistema'
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nombre: String
  },
  
  // Configuración de expiración
  expiracion: {
    fecha: Date,
    expirada: {
      type: Boolean,
      default: false
    }
  },
  
  // Fechas importantes
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaLeida: Date,
  fechaArchivada: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
notificationSchema.index({ usuario: 1, estado: 1 });
notificationSchema.index({ tipo: 1 });
notificationSchema.index({ fechaCreacion: -1 });
notificationSchema.index({ prioridad: 1 });
notificationSchema.index({ 'expiracion.fecha': 1 });

// Virtual para verificar si está expirada
notificationSchema.virtual('estaExpirada').get(function() {
  if (!this.expiracion.fecha) return false;
  return new Date() > this.expiracion.fecha;
});

// Virtual para obtener el icono según el tipo
notificationSchema.virtual('icono').get(function() {
  const iconos = {
    producto_aprobado: 'check-circle',
    producto_rechazado: 'x-circle',
    nueva_venta: 'shopping-cart',
    pedido_confirmado: 'package',
    pedido_enviado: 'truck',
    pedido_entregado: 'check',
    pedido_cancelado: 'x',
    nueva_reseña: 'star',
    respuesta_reseña: 'message-circle',
    stock_bajo: 'alert-triangle',
    nuevo_mensaje: 'mail',
    promocion: 'gift',
    sistema: 'info'
  };
  
  return iconos[this.tipo] || 'bell';
});

// Virtual para obtener el color según la prioridad
notificationSchema.virtual('color').get(function() {
  const colores = {
    baja: '#6B7280',
    media: '#3B82F6',
    alta: '#F59E0B',
    urgente: '#EF4444'
  };
  
  return colores[this.prioridad] || '#6B7280';
});

// Middleware para marcar como expirada
notificationSchema.pre('save', function(next) {
  if (this.expiracion.fecha && new Date() > this.expiracion.fecha) {
    this.expiracion.expirada = true;
  }
  next();
});

// Método para marcar como leída
notificationSchema.methods.marcarLeida = function() {
  this.estado = 'leida';
  this.fechaLeida = new Date();
  return this.save();
};

// Método para archivar
notificationSchema.methods.archivar = function() {
  this.estado = 'archivada';
  this.fechaArchivada = new Date();
  return this.save();
};

// Método para marcar envío por canal
notificationSchema.methods.marcarEnviado = function(canal, error = null) {
  if (this.estadoEnvio[canal]) {
    this.estadoEnvio[canal].enviado = true;
    this.estadoEnvio[canal].fechaEnvio = new Date();
    if (error) {
      this.estadoEnvio[canal].error = error;
    }
    return this.save();
  }
  
  throw new Error(`Canal ${canal} no válido`);
};

// Método estático para obtener notificaciones no leídas
notificationSchema.statics.obtenerNoLeidas = function(usuarioId) {
  return this.find({
    usuario: usuarioId,
    estado: 'no_leida',
    'expiracion.expirada': { $ne: true }
  }).sort({ fechaCreacion: -1 });
};

// Método estático para contar notificaciones no leídas
notificationSchema.statics.contarNoLeidas = function(usuarioId) {
  return this.countDocuments({
    usuario: usuarioId,
    estado: 'no_leida',
    'expiracion.expirada': { $ne: true }
  });
};

// Método estático para crear notificación
notificationSchema.statics.crear = function(datos) {
  const notificacion = new this(datos);
  return notificacion.save();
};

// Método estático para limpiar notificaciones expiradas
notificationSchema.statics.limpiarExpiradas = function() {
  return this.deleteMany({
    'expiracion.fecha': { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 