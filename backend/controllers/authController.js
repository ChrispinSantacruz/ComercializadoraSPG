const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');
const { 
  generarTokenAcceso, 
  generarTokenVerificacion, 
  generarTokenRecuperacion,
  establecerTokenEnCookie,
  limpiarTokenDeCookie,
  verificarToken
} = require('../utils/jwt');
const { enviarEmailBienvenida, enviarEmailRecuperacion } = require('../utils/email');
const passport = require('passport');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Public
const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, rol = 'cliente' } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    
    if (usuarioExistente) {
      return errorResponse(res, 'Este email ya está registrado', 400);
    }

    // Crear usuario
    const usuario = new User({
      nombre,
      email,
      password,
      telefono,
      rol
    });

    await usuario.save();

    // Generar token de verificación
    const tokenVerificacion = generarTokenVerificacion(usuario._id, email);
    
    // Guardar token en el usuario
    usuario.tokenVerificacion = tokenVerificacion;
    await usuario.save();

    // Enviar email de bienvenida
    try {
      await enviarEmailBienvenida(email, nombre, tokenVerificacion);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
      // No fallar el registro si el email falla
    }

    successResponse(res, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.', {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    }, 201);

  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
const iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario con contraseña
    const usuario = await User.findOne({ email }).select('+password');

    if (!usuario) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    // Verificar estado del usuario
    if (usuario.estado === 'bloqueado') {
      return errorResponse(res, 'Tu cuenta ha sido bloqueada. Contacta al administrador.', 403);
    }

    if (usuario.estado === 'inactivo') {
      return errorResponse(res, 'Tu cuenta está inactiva. Verifica tu email para activarla.', 403);
    }

    // Generar token de acceso
    const token = generarTokenAcceso(usuario._id, usuario.rol);

    // Establecer cookie
    establecerTokenEnCookie(res, token);

    // Actualizar fecha de último login
    usuario.fechaUltimoLogin = new Date();
    await usuario.save();

    successResponse(res, 'Sesión iniciada exitosamente', {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        configuracion: usuario.configuracion
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Private
const cerrarSesion = async (req, res, next) => {
  try {
    // Limpiar cookie
    limpiarTokenDeCookie(res);

    successResponse(res, 'Sesión cerrada exitosamente');

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/perfil
// @access  Private
const obtenerPerfilActual = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json(
        errorResponse(res, 'Usuario no encontrado', 400)
      );
    }

    successResponse(res, 'Perfil obtenido exitosamente', {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        avatar: usuario.avatar,
        estado: usuario.estado,
        configuracion: usuario.configuracion,
        direccion: usuario.direccion,
        metodosPago: usuario.metodosPago,
        estadisticasComerciante: usuario.estadisticasComerciante,
        fechaCreacion: usuario.fechaCreacion,
        fechaUltimoLogin: usuario.fechaUltimoLogin
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verificar email
// @route   POST /api/auth/verificar-email
// @access  Public
const verificarEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(
        errorResponse(res, 'Token de verificación requerido', 400)
      );
    }

    // Verificar token
    let decoded;
    try {
      decoded = verificarToken(token);
    } catch (error) {
      return res.status(400).json(
        errorResponse(res, 'Token inválido o expirado', 400)
      );
    }

    // Verificar que sea token de verificación
    if (decoded.tipo !== 'verificacion') {
      return res.status(400).json(
        errorResponse(res, 'Tipo de token inválido', 400)
      );
    }

    // Buscar usuario
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json(
        errorResponse(res, 'Usuario no encontrado', 400)
      );
    }

    // Verificar que el token coincida
    if (usuario.tokenVerificacion !== token) {
      return res.status(400).json(
        errorResponse(res, 'Token inválido', 400)
      );
    }

    // Activar usuario
    usuario.estado = 'activo';
    usuario.fechaVerificacion = new Date();
    usuario.tokenVerificacion = undefined;
    await usuario.save();

    successResponse(res, 'Email verificado exitosamente. Tu cuenta ha sido activada.');

  } catch (error) {
    next(error);
  }
};

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/auth/recuperar-password
// @access  Public
const solicitarRecuperacionPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Buscar usuario
    const usuario = await User.findOne({ email });

    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return successResponse(res, 'Si el email existe, recibirás un enlace de recuperación.');
    }

    // Generar token de recuperación
    const tokenRecuperacion = generarTokenRecuperacion(usuario._id, email);

    // Guardar token en el usuario
    usuario.tokenRecuperacion = tokenRecuperacion;
    usuario.fechaRecuperacion = new Date();
    await usuario.save();

    // Enviar email de recuperación
    try {
      await enviarEmailRecuperacion(email, usuario.nombre, tokenRecuperacion);
    } catch (emailError) {
      console.error('Error enviando email de recuperación:', emailError);
      return res.status(500).json(
        errorResponse(res, 'Error enviando email de recuperación', 400)
      );
    }

    successResponse(res, 'Si el email existe, recibirás un enlace de recuperación.');

  } catch (error) {
    next(error);
  }
};

// @desc    Restablecer contraseña
// @route   POST /api/auth/restablecer-password
// @access  Public
const restablecerPassword = async (req, res, next) => {
  try {
    const { token, nuevaPassword } = req.body;

    if (!token || !nuevaPassword) {
      return res.status(400).json(
        errorResponse(res, 'Token y nueva contraseña son requeridos', 400)
      );
    }

    // Verificar token
    let decoded;
    try {
      decoded = verificarToken(token);
    } catch (error) {
      return res.status(400).json(
        errorResponse(res, 'Token inválido o expirado', 400)
      );
    }

    // Verificar que sea token de recuperación
    if (decoded.tipo !== 'recuperacion') {
      return res.status(400).json(
        errorResponse(res, 'Tipo de token inválido', 400)
      );
    }

    // Buscar usuario
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json(
        errorResponse(res, 'Usuario no encontrado', 400)
      );
    }

    // Verificar que el token coincida
    if (usuario.tokenRecuperacion !== token) {
      return res.status(400).json(
        errorResponse(res, 'Token inválido', 400)
      );
    }

    // Actualizar contraseña
    usuario.password = nuevaPassword;
    usuario.tokenRecuperacion = undefined;
    usuario.fechaRecuperacion = undefined;
    await usuario.save();

    successResponse(res, 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');

  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar contraseña (usuario autenticado)
// @route   PUT /api/auth/cambiar-password
// @access  Private
const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;

    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json(
        errorResponse(res, 'Contraseña actual y nueva contraseña son requeridas', 400)
      );
    }

    // Buscar usuario con contraseña
    const usuario = await User.findById(req.usuario._id).select('+password');

    // Verificar contraseña actual
    const passwordValida = await usuario.compararPassword(passwordActual);

    if (!passwordValida) {
      return res.status(400).json(
        errorResponse(res, 'Contraseña actual incorrecta', 400)
      );
    }

    // Actualizar contraseña
    usuario.password = nuevaPassword;
    await usuario.save();

    successResponse(res, 'Contraseña cambiada exitosamente');

  } catch (error) {
    next(error);
  }
};

// @desc    Reenviar email de verificación
// @route   POST /api/auth/reenviar-verificacion
// @access  Public
const reenviarVerificacion = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Buscar usuario
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(404).json(
        errorResponse(res, 'Usuario no encontrado', 400)
      );
    }

    // Verificar si ya está verificado
    if (usuario.estado === 'activo') {
      return res.status(400).json(
        errorResponse(res, 'La cuenta ya está verificada', 400)
      );
    }

    // Generar nuevo token de verificación
    const tokenVerificacion = generarTokenVerificacion(usuario._id, email);
    
    // Guardar token en el usuario
    usuario.tokenVerificacion = tokenVerificacion;
    await usuario.save();

    // Enviar email de verificación
    try {
      await enviarEmailBienvenida(email, usuario.nombre, tokenVerificacion);
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      return res.status(500).json(
        errorResponse(res, 'Error enviando email de verificación', 400)
      );
    }

    successResponse(res, 'Email de verificación enviado exitosamente');

  } catch (error) {
    next(error);
  }
};

// @desc    Callback de Google OAuth
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Generar token de acceso
    const token = generarTokenAcceso(user._id, user.rol);

    // Establecer cookie
    establecerTokenEnCookie(res, token);

    // Actualizar fecha de último login
    user.fechaUltimoLogin = new Date();
    await user.save();

    // Redirigir al frontend con token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      avatar: user.fotoPerfilSocial || user.avatar
    }))}`);

  } catch (error) {
    console.error('Error en callback de Google:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/login?error=oauth_error`);
  }
};

// @desc    Callback de Facebook OAuth
// @route   GET /api/auth/facebook/callback
// @access  Public
const facebookCallback = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Generar token de acceso
    const token = generarTokenAcceso(user._id, user.rol);

    // Establecer cookie
    establecerTokenEnCookie(res, token);

    // Actualizar fecha de último login
    user.fechaUltimoLogin = new Date();
    await user.save();

    // Redirigir al frontend con token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      avatar: user.fotoPerfilSocial || user.avatar
    }))}`);

  } catch (error) {
    console.error('Error en callback de Facebook:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/login?error=oauth_error`);
  }
};

// @desc    Failure callback para OAuth
// @route   GET /api/auth/failure
// @access  Public
const oauthFailure = (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendURL}/login?error=oauth_cancelled`);
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfilActual,
  verificarEmail,
  solicitarRecuperacionPassword,
  restablecerPassword,
  cambiarPassword,
  reenviarVerificacion,
  googleCallback,
  facebookCallback,
  oauthFailure
}; 
