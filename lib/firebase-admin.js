// lib/firebase-admin.js
import admin from "firebase-admin";

// Obtener credenciales desde variables de entorno
const getServiceAccount = () => {
  // Verificar que todas las variables requeridas existan
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_DATABASE_URL'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`❌ Variable de entorno faltante: ${varName}`);
    }
  }

  // IMPORTANTE: Reemplazar los \n literales por saltos de línea reales
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  // Si la private key viene con \n literales (como en tu .env), los convertimos
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  // También verificar si viene sin los \n pero con comillas
  privateKey = privateKey.replace(/"/g, '').trim();

  return {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "",
    universe_domain: "googleapis.com"
  };
};

// Variable global para cachear la instancia
let dbInstance = null;
let adminInstance = null;

const initializeFirebase = () => {
  try {
    // Si ya está inicializado, devolver las instancias existentes
    if (adminInstance && dbInstance) {
      return { db: dbInstance, admin: adminInstance };
    }

    // Obtener credenciales desde variables de entorno
    const serviceAccount = getServiceAccount();
    
    // Verificar que la private key es válida
    if (!serviceAccount.private_key || !serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Private key de Firebase inválida o mal formateada');
    }

    // Inicializar la app si no existe
    if (!admin.apps.length) {
      adminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      console.log('✅ Firebase Admin inicializado correctamente');
    } else {
      // Usar la app ya inicializada
      adminInstance = admin.app();
    }

    // Crear instancia de la base de datos
    dbInstance = adminInstance.database();
    
    return { db: dbInstance, admin: adminInstance };
    
  } catch (error) {
    console.error('❌ Error crítico al inicializar Firebase:', error.message);
    
    // Log más detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Detalles del error:', error);
      console.error('Variables de entorno cargadas:', {
        projectId: process.env.FIREBASE_PROJECT_ID ? '✅' : '❌',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '✅' : '❌',
        databaseURL: process.env.FIREBASE_DATABASE_URL ? '✅' : '❌',
        privateKeyPresent: process.env.FIREBASE_PRIVATE_KEY ? '✅' : '❌',
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
      });
    }
    
    throw error;
  }
};

// Inicializar Firebase al importar el módulo
const { db, admin } = initializeFirebase();

export { db, admin };