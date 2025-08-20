const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código del cupón es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'El código debe tener al menos 3 caracteres'],
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },
  
  nombre: {
    type: String,
    required: [true, 'El nombre del cupón es requerido'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  
  // Tipo de descuento
  tipoDescuento: {
    type: String,
    enum: ['porcentaje', 'monto_fijo', 'envio_gratis'],
    required: [true, 'El tipo de descuento es requerido']
  },
  
  // Valor del descuento
  valor: {
    type: Number,
    required: [true, 'El valor del descuento es requerido'],
    min: [0, 'El valor no puede ser negativo']
  },
  
  // Porcentaje máximo para descuentos de porcentaje
  porcentajeMaximo: {
    type: Number,
    min: [0, 'El porcentaje máximo no puede ser negativo'],
    max: [100, 'El porcentaje máximo no puede exceder 100%']
  },
  
  // Monto mínimo de compra para aplicar el cupón
  montoMinimo: {
    type: Number,
    default: 0,
    min: [0, 'El monto mínimo no puede ser negativo']
  },
  
  // Monto máximo de descuento
  montoMaximo: {
    type: Number,
    min: [0, 'El monto máximo no puede ser negativo']
  },
  
  // Fechas de validez
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  
  fechaVencimiento: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  
  // Limitaciones de uso
  usoMaximo: {
    type: Number,
    default: null, // null = ilimitado
    min: [1, 'El uso máximo debe ser al menos 1']
  },
  
  usoMaximoPorUsuario: {
    type: Number,
    default: 1,
    min: [1, 'El uso máximo por usuario debe ser al menos 1']
  },
  
  // Contadores de uso
  usoActual: {
    type: Number,
    default: 0,
    min: [0, 'El uso actual no puede ser negativo']
  },
  
  // Usuarios que han usado el cupón
  usuariosUsaron: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fechaUso: {
      type: Date,
      default: Date.now
    },
    cantidadUsos: {
      type: Number,
      default: 1
    }
  }],
  
  // Restricciones de productos/categorías
  restricciones: {
    productos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    categorias: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    comerciantes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Si está vacío, aplica a todos
    soloProductosEspecificos: {
      type: Boolean,
      default: false
    }
  },
  
  // Estado del cupón
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'expirado', 'agotado'],
    default: 'activo'
  },
  
  // Configuraciones adicionales
  configuracion: {
    acumulableConOtrosDescuentos: {
      type: Boolean,
      default: false
    },
    aplicarSoloUnaVezPorPedido: {
      type: Boolean,
      default: true
    },
    mostrarEnListaPublica: {
      type: Boolean,
      default: false
    }
  },
  
  // Información del creador
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Fechas de auditoría
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

// Índices
couponSchema.index({ codigo: 1 });
couponSchema.index({ estado: 1 });
couponSchema.index({ fechaVencimiento: 1 });
couponSchema.index({ 'restricciones.productos': 1 });
couponSchema.index({ 'restricciones.categorias': 1 });

// Virtual para verificar si el cupón está vigente
couponSchema.virtual('estaVigente').get(function() {
  const ahora = new Date();
  return this.fechaInicio <= ahora && this.fechaVencimiento >= ahora;
});

// Virtual para verificar si está disponible
couponSchema.virtual('estaDisponible').get(function() {
  return this.estado === 'activo' && 
         this.estaVigente && 
         (this.usoMaximo === null || this.usoActual < this.usoMaximo);
});

// Middleware pre-save para actualizar estado automáticamente
couponSchema.pre('save', function(next) {
  const ahora = new Date();
  
  // Actualizar estado basado en fechas
  if (this.fechaVencimiento < ahora) {
    this.estado = 'expirado';
  } else if (this.usoMaximo && this.usoActual >= this.usoMaximo) {
    this.estado = 'agotado';
  } else if (this.fechaInicio <= ahora && this.fechaVencimiento >= ahora && this.estado === 'inactivo') {
    // No cambiar automáticamente a activo si está inactivo manualmente
  }
  
  this.fechaActualizacion = ahora;
  next();
});

// Método para validar si el cupón puede ser usado por un usuario
couponSchema.methods.puedeUsarUsuario = function(usuarioId) {
  if (!this.estaDisponible) return false;
  
  const usoUsuario = this.usuariosUsaron.find(u => u.usuario.toString() === usuarioId.toString());
  if (usoUsuario) {
    return usoUsuario.cantidadUsos < this.usoMaximoPorUsuario;
  }
  
  return true;
};

// Método para calcular descuento
couponSchema.methods.calcularDescuento = function(subtotal, productos = []) {
  if (!this.estaDisponible) return 0;
  
  // Verificar monto mínimo
  if (subtotal < this.montoMinimo) return 0;
  
  let descuento = 0;
  
  switch (this.tipoDescuento) {
    case 'porcentaje':
      descuento = subtotal * (this.valor / 100);
      if (this.montoMaximo && descuento > this.montoMaximo) {
        descuento = this.montoMaximo;
      }
      break;
      
    case 'monto_fijo':
      descuento = Math.min(this.valor, subtotal);
      break;
      
    case 'envio_gratis':
      // El descuento será manejado en el cálculo de envío
      descuento = 0;
      break;
  }
  
  return Math.round(descuento * 100) / 100; // Redondear a 2 decimales
};

// Método para registrar uso
couponSchema.methods.registrarUso = function(usuarioId) {
  const usoExistente = this.usuariosUsaron.find(u => u.usuario.toString() === usuarioId.toString());
  
  if (usoExistente) {
    usoExistente.cantidadUsos += 1;
    usoExistente.fechaUso = new Date();
  } else {
    this.usuariosUsaron.push({
      usuario: usuarioId,
      fechaUso: new Date(),
      cantidadUsos: 1
    });
  }
  
  this.usoActual += 1;
};

module.exports = mongoose.model('Coupon', couponSchema); 