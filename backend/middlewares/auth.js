const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    let token;
    
    // Verificar si el token está en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // También verificar en cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Acceso denegado. Token no proporcionado.'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario
    const usuario = await User.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido. Usuario no encontrado.'
      });
    }
    
    // Verificar si el usuario está activo
    if (usuario.estado !== 'activo') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Cuenta inactiva o bloqueada.'
      });
    }
    
    // Agregar usuario a la request
    req.usuario = usuario;
    next();
    
  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token expirado.'
      });
    }
    
    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

// Middleware para verificar roles
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Acceso denegado. Usuario no autenticado.'
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Acceso denegado. Permisos insuficientes.',
        rolRequerido: rolesPermitidos,
        rolActual: req.usuario.rol
      });
    }
    
    next();
  };
};

// Middleware específicos por rol
const soloAdministrador = verificarRol('administrador');
const soloComerciante = verificarRol('comerciante', 'administrador');
const soloCliente = verificarRol('cliente', 'comerciante', 'administrador');

// Middleware para verificar propiedad del recurso
const verificarPropiedad = (modeloNombre, campoPropietario = 'usuario') => {
  return async (req, res, next) => {
    try {
      const Modelo = require(`../models/${modeloNombre}`);
      const recursoId = req.params.id;
      
      const recurso = await Modelo.findById(recursoId);
      
      if (!recurso) {
        return res.status(404).json({
          exito: false,
          mensaje: `${modeloNombre} no encontrado.`
        });
      }
      
      // Los administradores pueden acceder a todo
      if (req.usuario.rol === 'administrador') {
        req.recurso = recurso;
        return next();
      }
      
      // Verificar si el usuario es propietario del recurso
      const propietarioId = recurso[campoPropietario];
      
      if (propietarioId.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
          exito: false,
          mensaje: 'Acceso denegado. No tienes permisos para este recurso.'
        });
      }
      
      req.recurso = recurso;
      next();
      
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

// Middleware para verificar si el comerciante puede realizar la acción
const verificarComercianteActivo = async (req, res, next) => {
  try {
    if (req.usuario.rol !== 'comerciante' && req.usuario.rol !== 'administrador') {
      return res.status(403).json({
        exito: false,
        mensaje: 'Solo los comerciantes pueden realizar esta acción.'
      });
    }
    
    // Verificar estadísticas del comerciante si es necesario
    if (req.usuario.rol === 'comerciante') {
      // Aquí se pueden agregar validaciones adicionales
      // como límites de productos, verificación de documentos, etc.
    }
    
    next();
    
  } catch (error) {
    console.error('Error en verificación de comerciante:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

// Middleware para verificar compra antes de reseña
const verificarCompraParaReseña = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const { productoId } = req.params;
    
    // Buscar si el usuario compró el producto
    const pedido = await Order.findOne({
      cliente: req.usuario._id,
      'productos.producto': productoId,
      estado: 'entregado'
    });
    
    if (!pedido) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Solo puedes reseñar productos que hayas comprado.'
      });
    }
    
    req.pedidoCompra = pedido;
    next();
    
  } catch (error) {
    console.error('Error en verificación de compra:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

// Middleware opcional (para rutas que pueden o no requerir autenticación)
const autenticacionOpcional = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await User.findById(decoded.id).select('-password');
        
        if (usuario && usuario.estado === 'activo') {
          req.usuario = usuario;
        }
      } catch (error) {
        // Token inválido o expirado, pero continuamos sin usuario
        console.log('Token opcional inválido:', error.message);
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    next(); // Continuamos sin usuario autenticado
  }
};

module.exports = {
  verificarToken,
  protect: verificarToken,
  verificarRol,
  authorize: verificarRol,
  soloAdministrador,
  soloComerciante,
  soloCliente,
  verificarPropiedad,
  verificarComercianteActivo,
  verificarCompraParaReseña,
  autenticacionOpcional
}; 