const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Categoría padre (para subcategorías)
  padre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // Imagen de la categoría
  imagen: {
    url: String,
    publicId: String,
    alt: String
  },
  
  // Icono de la categoría
  icono: {
    type: String,
    default: 'shopping-bag'
  },
  
  // Color de la categoría (para UI)
  color: {
    type: String,
    default: '#1D4ED8'
  },
  
  // Estado de la categoría
  estado: {
    type: String,
    enum: ['activa', 'inactiva', 'pendiente'],
    default: 'pendiente'
  },
  
  // Comerciante que propuso la categoría
  propuestaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Administrador que aprobó la categoría
  aprobadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Orden de visualización
  orden: {
    type: Number,
    default: 0
  },
  
  // Mostrar en menu principal
  mostrarEnMenu: {
    type: Boolean,
    default: true
  },
  
  // Mostrar en página principal
  destacada: {
    type: Boolean,
    default: false
  },
  
  // Metadatos para SEO
  seo: {
    titulo: String,
    descripcion: String,
    palabrasClave: [String]
  },
  
  // Estadísticas de la categoría
  estadisticas: {
    totalProductos: {
      type: Number,
      default: 0
    },
    productosActivos: {
      type: Number,
      default: 0
    },
    totalVentas: {
      type: Number,
      default: 0
    },
    vistasTotal: {
      type: Number,
      default: 0
    }
  },
  
  // Fechas importantes
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  fechaAprobacion: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
categorySchema.index({ nombre: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ estado: 1 });
categorySchema.index({ padre: 1 });
categorySchema.index({ orden: 1 });
categorySchema.index({ destacada: 1 });

// Middleware para generar slug antes de guardar
categorySchema.pre('save', function(next) {
  if (this.isModified('nombre') || this.isNew) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  this.fechaActualizacion = new Date();
  next();
});

// Virtual para obtener subcategorías
categorySchema.virtual('subcategorias', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'padre',
  justOne: false
});

// Virtual para obtener productos de la categoría
categorySchema.virtual('productos', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoria',
  justOne: false
});

// Virtual para verificar si es categoría padre
categorySchema.virtual('esPadre').get(function() {
  return this.padre === null;
});

// Virtual para obtener ruta completa de la categoría
categorySchema.virtual('rutaCompleta').get(function() {
  if (!this.padre) {
    return this.nombre;
  }
  // Esto requeriría población del padre
  return this.nombre;
});

// Método para incrementar vistas
categorySchema.methods.incrementarVistas = function() {
  this.estadisticas.vistasTotal += 1;
  return this.save();
};

// Método para actualizar estadísticas de productos
categorySchema.methods.actualizarEstadisticas = function(totalProductos, productosActivos) {
  this.estadisticas.totalProductos = totalProductos;
  this.estadisticas.productosActivos = productosActivos;
  return this.save();
};

// Método estático para obtener categorías activas
categorySchema.statics.obtenerActivas = function() {
  return this.find({ estado: 'activa' }).sort({ orden: 1, nombre: 1 });
};

// Método estático para obtener categorías principales
categorySchema.statics.obtenerPrincipales = function() {
  return this.find({ 
    estado: 'activa', 
    padre: null,
    mostrarEnMenu: true 
  }).sort({ orden: 1, nombre: 1 });
};

// Método estático para obtener categorías destacadas
categorySchema.statics.obtenerDestacadas = function() {
  return this.find({ 
    estado: 'activa', 
    destacada: true 
  }).sort({ orden: 1, nombre: 1 });
};

module.exports = mongoose.model('Category', categorySchema); 