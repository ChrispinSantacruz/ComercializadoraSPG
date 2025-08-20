// Middleware para manejo global de errores
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error capturado:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      exito: false,
      mensaje: 'Error de validación',
      errores: errores
    });
  }

  // Error de duplicado (código 11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    const valor = err.keyValue[campo];
    
    let mensaje = 'Recurso duplicado';
    
    // Mensajes específicos según el campo
    switch (campo) {
      case 'email':
        mensaje = 'Este email ya está registrado';
        break;
      case 'numeroOrden':
        mensaje = 'Número de orden duplicado';
        break;
      case 'slug':
        mensaje = 'Este identificador ya existe';
        break;
      default:
        mensaje = `El ${campo} '${valor}' ya existe`;
    }
    
    return res.status(400).json({
      exito: false,
      mensaje: mensaje,
      campo: campo
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de recurso inválido',
      campo: err.path
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token inválido'
    });
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token expirado'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Formato JSON inválido'
    });
  }

  // Error de archivo muy grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El archivo es demasiado grande'
    });
  }

  // Error de tipo de archivo
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      exito: false,
      mensaje: 'Tipo de archivo no permitido'
    });
  }

  // Error de conexión de base de datos
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error de base de datos'
    });
  }

  // Error de rate limiting
  if (err.statusCode === 429) {
    return res.status(429).json({
      exito: false,
      mensaje: 'Demasiadas peticiones, intenta de nuevo más tarde'
    });
  }

  // Errores específicos de la aplicación
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      exito: false,
      mensaje: err.message || 'Error del servidor'
    });
  }

  // Error interno del servidor por defecto
  res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

module.exports = errorHandler; 