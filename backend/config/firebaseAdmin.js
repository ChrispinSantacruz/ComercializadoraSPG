const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK si no está inicializado
if (!admin.apps.length) {
  let serviceAccount;
  
  // Verificar si se debe usar variables de entorno
  if (process.env.FIREBASE_USE_ENV === 'true') {
    // Configurar usando variables de entorno individuales
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };
  } else {
    // Fallback: usar JSON parseado o archivo local
    try {
      serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : require('../config/firebase-service-account.json');
    } catch (error) {
      console.error('Error loading Firebase service account:', error.message);
      console.error('Please ensure FIREBASE_USE_ENV=true and all Firebase environment variables are set, or provide a valid firebase-service-account.json file');
      process.exit(1);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();

module.exports = { admin, auth };
