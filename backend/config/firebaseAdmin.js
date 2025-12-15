const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK si no está inicializado
if (!admin.apps.length) {
  // Configuración usando variables de entorno o el archivo de credenciales
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../config/firebase-service-account.json'); // Opcional: archivo local

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();

module.exports = { admin, auth };
