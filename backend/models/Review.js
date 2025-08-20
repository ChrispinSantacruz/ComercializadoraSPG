const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Referencia al producto
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es requerido']
  },
  
  // Usuario que hace la reseña
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  
  // Pedido relacionado (para verificar que compró el producto)
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'El pedido es requerido']
  },
  
  // Calificación del 1 al 5
  calificacion: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  
  // Comentario de la reseña
  comentario: {
    type: String,
    required: [true, 'El comentario es requerido'],
    minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  
  // Título de la reseña
  titulo: {
    type: String,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  
  // Imágenes de la reseña (opcional)
  imagenes: [{
    url: String,
    publicId: String,
    descripcion: String
  }],
  
  // Aspectos específicos del producto
  aspectos: {
    calidad: {
      type: Number,
      min: 1,
      max: 5
    },
    precio: {
      type: Number,
      min: 1,
      max: 5
    },
    entrega: {
      type: Number,
      min: 1,
      max: 5
    },
    atencion: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Estado de la reseña
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada', 'reportada'],
    default: 'aprobada'
  },
  
  // Verificación de compra
  verificada: {
    type: Boolean,
    default: false
  },
  
  // Utilidad de la reseña (votos)
  utilidad: {
    votosUtiles: {
      type: Number,
      default: 0
    },
    votosNoUtiles: {
      type: Number,
      default: 0
    },
    usuariosVotaron: [{
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      voto: {
        type: String,
        enum: ['util', 'no_util']
      }
    }]
  },
  
  // Respuesta del comerciante
  respuestaComerciante: {
    mensaje: String,
    fecha: Date,
    comerciante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Información adicional
  recomendaria: {
    type: Boolean,
    default: true
  },
  
  // Reportes de la reseña
  reportes: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    motivo: {
      type: String,
      enum: ['spam', 'contenido_inapropiado', 'lenguaje_ofensivo', 'informacion_falsa', 'otro']
    },
    descripcion: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Fechas importantes
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

// Índices para mejorar rendimiento
reviewSchema.index({ producto: 1 });
reviewSchema.index({ usuario: 1 });
reviewSchema.index({ calificacion: -1 });
reviewSchema.index({ fechaCreacion: -1 });
reviewSchema.index({ estado: 1 });
reviewSchema.index({ verificada: 1 });

// Índice compuesto para evitar reseñas duplicadas
reviewSchema.index({ producto: 1, usuario: 1, pedido: 1 }, { unique: true });

// Virtual para calcular utilidad total
reviewSchema.virtual('utilidadTotal').get(function() {
  const total = this.utilidad.votosUtiles + this.utilidad.votosNoUtiles;
  return total > 0 ? (this.utilidad.votosUtiles / total) * 100 : 0;
});

// Virtual para calificación promedio de aspectos
reviewSchema.virtual('calificacionAspectos').get(function() {
  const aspectos = this.aspectos;
  const valores = Object.values(aspectos).filter(val => val > 0);
  if (valores.length === 0) return 0;
  return valores.reduce((sum, val) => sum + val, 0) / valores.length;
});

// Middleware para actualizar fecha de actualización
reviewSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método para votar utilidad de la reseña
reviewSchema.methods.votarUtilidad = function(usuarioId, tipoVoto) {
  // Verificar si el usuario ya votó
  const votoExistente = this.utilidad.usuariosVotaron.find(
    v => v.usuario.toString() === usuarioId.toString()
  );
  
  if (votoExistente) {
    // Actualizar voto existente
    if (votoExistente.voto === 'util' && tipoVoto === 'no_util') {
      this.utilidad.votosUtiles -= 1;
      this.utilidad.votosNoUtiles += 1;
    } else if (votoExistente.voto === 'no_util' && tipoVoto === 'util') {
      this.utilidad.votosNoUtiles -= 1;
      this.utilidad.votosUtiles += 1;
    }
    votoExistente.voto = tipoVoto;
  } else {
    // Nuevo voto
    if (tipoVoto === 'util') {
      this.utilidad.votosUtiles += 1;
    } else {
      this.utilidad.votosNoUtiles += 1;
    }
    this.utilidad.usuariosVotaron.push({
      usuario: usuarioId,
      voto: tipoVoto
    });
  }
  
  return this.save();
};

// Método para agregar respuesta del comerciante
reviewSchema.methods.responderComerciante = function(mensaje, comercianteId) {
  this.respuestaComerciante = {
    mensaje,
    fecha: new Date(),
    comerciante: comercianteId
  };
  return this.save();
};

// Método para reportar reseña
reviewSchema.methods.reportar = function(usuarioId, motivo, descripcion) {
  this.reportes.push({
    usuario: usuarioId,
    motivo,
    descripcion
  });
  
  // Si tiene más de 3 reportes, marcar como reportada
  if (this.reportes.length >= 3) {
    this.estado = 'reportada';
  }
  
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema); 