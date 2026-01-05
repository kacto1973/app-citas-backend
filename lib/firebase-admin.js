// lib/firebase-admin.js
import admin from "firebase-admin";

const getServiceAccount = () => {
  const requiredVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_DATABASE_URL",
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`❌ Variable de entorno faltante: ${varName}`);
    }
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  privateKey = privateKey.replace(/"/g, "").trim();

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
    universe_domain: "googleapis.com",
  };
};

let dbInstance = null;
let adminInstance = null;

const initializeFirebase = () => {
  try {
    if (adminInstance && dbInstance) {
      console.log("♻️ Usando instancia de Firebase existente");
      return { db: dbInstance, admin: adminInstance };
    }

    const serviceAccount = getServiceAccount();

    if (
      !serviceAccount.private_key ||
      !serviceAccount.private_key.includes("BEGIN PRIVATE KEY")
    ) {
      throw new Error("Private key de Firebase inválida o mal formateada");
    }

    if (!admin.apps.length) {
      adminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log("✅ Firebase Admin inicializado correctamente");
    } else {
      adminInstance = admin.app();
      console.log("♻️ Usando app de Firebase existente");
    }

    dbInstance = adminInstance.database();

    return { db: dbInstance, admin: adminInstance };
  } catch (error) {
    console.error("❌ Error crítico al inicializar Firebase:", error.message);

    if (process.env.NODE_ENV === "development") {
      console.error("Detalles del error:", error);
      console.error("Variables de entorno cargadas:", {
        projectId: process.env.FIREBASE_PROJECT_ID ? "✅" : "❌",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "✅" : "❌",
        databaseURL: process.env.FIREBASE_DATABASE_URL ? "✅" : "❌",
        privateKeyPresent: process.env.FIREBASE_PRIVATE_KEY ? "✅" : "❌",
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      });
    }

    throw error;
  }
};

const { db, admin: firebaseAdmin } = initializeFirebase();

// ✅ UN SOLO EXPORT
export { db, firebaseAdmin as admin };
