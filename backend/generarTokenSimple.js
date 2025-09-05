const jwt = require('jsonwebtoken');

// Usar la misma configuración que en server.js
const JWT_SECRET = 'mi_secreto_jwt_comercializadora_2024';

// Datos del comerciante (mismo ID que hemos estado usando)
const payload = {
  id: '68b64ab65676e1ce5c506bae',
  email: 'admin@comerciante.com',
  rol: 'comerciante'
};

// Generar token con expiración de 24 horas
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 TOKEN GENERADO SIMPLE:');
console.log(token);
console.log('\n📋 Payload:');
console.log(JSON.stringify(payload, null, 2));

// Verificar que el token es válido
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n✅ Token verificado exitosamente:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('\n❌ Error verificando token:', error.message);
}

console.log('\n💡 COMANDO PARA EL FRONTEND:');
console.log(`localStorage.clear(); const authData = { state: { user: { id: "${payload.id}", nombre: "christian", email: "${payload.email}", rol: "${payload.rol}" }, token: "${token}", isAuthenticated: true } }; localStorage.setItem("auth-storage", JSON.stringify(authData)); window.location.reload();`);
