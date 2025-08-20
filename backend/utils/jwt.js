const jwt = require('jsonwebtoken');

// Generar token JWT
const generarToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Verificar token JWT
const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Decodificar token sin verificar (útil para obtener info expirada)
const decodificarToken = (token) => {
  return jwt.decode(token);
};

// Generar token de acceso
const generarTokenAcceso = (usuarioId, rol) => {
  return generarToken({
    id: usuarioId,
    rol: rol
  }, '7d'); // Token de acceso válido por 7 días
};

// Generar token de actualización
const generarTokenActualizacion = (usuarioId) => {
  return generarToken({
    id: usuarioId,
    tipo: 'refresh'
  }, '30d'); // Token de actualización válido por 30 días
};

// Generar token de verificación de email
const generarTokenVerificacion = (usuarioId, email) => {
  return generarToken({
    id: usuarioId,
    email: email,
    tipo: 'verificacion'
  }, '24h'); // Token válido por 24 horas
};

// Generar token de recuperación de contraseña
const generarTokenRecuperacion = (usuarioId, email) => {
  return generarToken({
    id: usuarioId,
    email: email,
    tipo: 'recuperacion'
  }, '1h'); // Token válido por 1 hora
};

// Extraer token del header Authorization
const extraerTokenDelHeader = (authHeader) => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Establecer token en cookie
const establecerTokenEnCookie = (res, token, httpOnly = true) => {
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    httpOnly: httpOnly,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('token', token, options);
};

// Limpiar cookie de token
const limpiarTokenDeCookie = (res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

module.exports = {
  generarToken,
  verificarToken,
  decodificarToken,
  generarTokenAcceso,
  generarTokenActualizacion,
  generarTokenVerificacion,
  generarTokenRecuperacion,
  extraerTokenDelHeader,
  establecerTokenEnCookie,
  limpiarTokenDeCookie
}; 