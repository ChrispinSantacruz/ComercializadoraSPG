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
const { auth } = require('../config/firebaseAdmin');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Public
const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, rol = 'cliente', nombreEmpresa } = req.body;

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
      rol,
      nombreEmpresa: rol === 'comerciante' ? nombreEmpresa : undefined,
      proveedor: 'local'
      // No establecer proveedorId para usuarios locales (se queda undefined)
    });

    await usuario.save();

    // Generar código de verificación de 6 dígitos
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Establecer expiración del código (15 minutos)
    const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000);
    
    // Generar token de verificación (como respaldo)
    const tokenVerificacion = generarTokenVerificacion(usuario._id, email);
    
    // Guardar datos de verificación en el usuario
    usuario.tokenVerificacion = tokenVerificacion;
    usuario.codigoVerificacion = codigoVerificacion;
    usuario.codigoExpiracion = codigoExpiracion;
    await usuario.save();

    // Enviar email de bienvenida con código
    try {
      await enviarEmailBienvenida(email, nombre, codigoVerificacion);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
      // No fallar el registro si el email falla
    }

    successResponse(res, 'Usuario registrado exitosamente. Revisa tu email para obtener el código de verificación.', {
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

// @desc    Verificar email con código
// @route   POST /api/auth/verificar-codigo
// @access  Public
const verificarEmailConCodigo = async (req, res, next) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return errorResponse(res, 'Email y código son requeridos', 400);
    }

    // Buscar usuario
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Verificar que el código coincida
    if (usuario.codigoVerificacion !== codigo) {
      return errorResponse(res, 'Código de verificación incorrecto', 400);
    }

    // Verificar que el código no haya expirado
    if (new Date() > usuario.codigoExpiracion) {
      return errorResponse(res, 'El código de verificación ha expirado. Solicita uno nuevo.', 400);
    }

    // Activar usuario
    usuario.verificado = true;
    usuario.estado = 'activo';
    usuario.fechaVerificacion = new Date();
    usuario.codigoVerificacion = undefined;
    usuario.codigoExpiracion = undefined;
    usuario.tokenVerificacion = undefined;
    await usuario.save();

    // Generar token de acceso
    const token = generarTokenAcceso(usuario._id, usuario.rol);

    successResponse(res, 'Email verificado exitosamente. Tu cuenta ha sido activada.', {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        verificado: usuario.verificado
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reenviar código de verificación
// @route   POST /api/auth/reenviar-codigo
// @access  Public
const reenviarCodigoVerificacion = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email es requerido', 400);
    }

    // Buscar usuario
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    if (usuario.verificado) {
      return errorResponse(res, 'Este usuario ya está verificado', 400);
    }

    // Generar nuevo código de verificación
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    usuario.codigoVerificacion = codigoVerificacion;
    usuario.codigoExpiracion = codigoExpiracion;
    await usuario.save();

    // Enviar email con nuevo código
    try {
      await enviarEmailBienvenida(email, usuario.nombre, codigoVerificacion);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      return errorResponse(res, 'Error al enviar el email de verificación', 500);
    }

    successResponse(res, 'Código de verificación reenviado. Revisa tu email.');

  } catch (error) {
    next(error);
  }
};

// @desc    Verificar email con token (método anterior, mantener compatibilidad)
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
    usuario.verificado = true;
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

// @desc    Login con Firebase (Google/Facebook)
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, provider, email, nombre, photoURL } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Token de Firebase requerido', 400);
    }

    // Verificar el token de Firebase
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verificando token de Firebase:', error);
      return errorResponse(res, 'Token de Firebase inválido', 401);
    }

    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email || email;

    // Buscar usuario existente por email o por proveedorId
    let usuario = await User.findOne({
      $or: [
        { email: firebaseEmail },
        { proveedorId: firebaseUid, proveedor: provider }
      ]
    });

    if (usuario) {
      // Usuario existente - actualizar información si es necesario
      if (!usuario.proveedorId) {
        usuario.proveedorId = firebaseUid;
        usuario.proveedor = provider;
      }
      if (photoURL && !usuario.avatar) {
        usuario.avatar = photoURL;
      }
      usuario.verificado = true; // Los usuarios de OAuth ya están verificados
      await usuario.save();
    } else {
      // Crear nuevo usuario SIN ROL (lo seleccionará después)
      usuario = new User({
        nombre: nombre || decodedToken.name || 'Usuario',
        email: firebaseEmail,
        proveedor: provider,
        proveedorId: firebaseUid,
        avatar: photoURL || decodedToken.picture,
        verificado: true,
        rol: null, // Sin rol asignado inicialmente
        // No se establece password para usuarios OAuth
      });
      await usuario.save();
    }

    // Si el usuario NO tiene rol, devolver usuario sin token para que seleccione rol
    if (!usuario.rol) {
      return successResponse(res, 'Usuario registrado, debe seleccionar rol', {
        requiereSeleccionRol: true,
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          avatar: usuario.avatar,
          proveedor: usuario.proveedor
        }
      }, 200);
    }

    // Generar token JWT para la aplicación
    const token = generarTokenAcceso(usuario._id, usuario.email, usuario.rol);

    // Establecer cookie
    establecerTokenEnCookie(res, token);

    return successResponse(res, 'Autenticación exitosa', {
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        verificado: usuario.verificado,
        proveedor: usuario.proveedor
      }
    }, 200);

  } catch (error) {
    console.error('Error en firebaseLogin:', error);
    return errorResponse(res, 'Error en la autenticación', 500);
  }
};

// @desc    Seleccionar rol después del registro OAuth
// @route   POST /api/auth/seleccionar-rol
// @access  Public (con userId)
const seleccionarRol = async (req, res, next) => {
  try {
    const { userId, rol, nombreEmpresa, descripcionEmpresa, tipoDocumento, numeroDocumento } = req.body;

    if (!userId || !rol) {
      return errorResponse(res, 'Usuario y rol son requeridos', 400);
    }

    const usuario = await User.findById(userId);
    
    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    if (usuario.rol) {
      return errorResponse(res, 'El usuario ya tiene un rol asignado', 400);
    }

    // Actualizar rol
    usuario.rol = rol;

    // Si es comerciante, requerir datos adicionales
    if (rol === 'comerciante') {
      if (!nombreEmpresa || !descripcionEmpresa) {
        return errorResponse(res, 'Nombre y descripción de empresa son requeridos para comerciantes', 400);
      }
      
      usuario.nombreEmpresa = nombreEmpresa;
      usuario.descripcionEmpresa = descripcionEmpresa;
      usuario.tipoDocumento = tipoDocumento;
      usuario.numeroDocumento = numeroDocumento;
      
      // Generar código de verificación
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      usuario.codigoVerificacion = codigo;
      usuario.codigoExpiracion = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
      
      await usuario.save();
      
      // Enviar email con código
      await enviarEmailBienvenida(usuario.email, usuario.nombre, codigo);
      
      return successResponse(res, 'Datos de comerciante guardados. Revisa tu email para el código de verificación', {
        requiereVerificacion: true,
        userId: usuario._id
      }, 200);
    }

    // Si es cliente, solo guardar
    await usuario.save();

    // Generar token JWT
    const token = generarTokenAcceso(usuario._id, usuario.email, usuario.rol);
    establecerTokenEnCookie(res, token);

    return successResponse(res, 'Rol asignado exitosamente', {
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        verificado: usuario.verificado
      }
    }, 200);

  } catch (error) {
    console.error('Error en seleccionarRol:', error);
    return errorResponse(res, 'Error al seleccionar rol', 500);
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfilActual,
  verificarEmail,
  verificarEmailConCodigo,
  reenviarCodigoVerificacion,
  solicitarRecuperacionPassword,
  restablecerPassword,
  cambiarPassword,
  reenviarVerificacion,
  googleCallback,
  facebookCallback,
  oauthFailure,
  firebaseLogin,
  seleccionarRol
}; 
