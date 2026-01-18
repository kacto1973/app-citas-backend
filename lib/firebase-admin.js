// lib/firebase-admin.js
import admin from "firebase-admin";

let dbInstance = null;
let adminInstance = null;

const initializeFirebase = () => {
  if (adminInstance && dbInstance) {
    return { db: dbInstance, admin: adminInstance };
  }

  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("FIREBASE_CREDENTIALS no encontrado");
  }

  const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

  if (
    !credentials.private_key ||
    !credentials.client_email ||
    !credentials.project_id
  ) {
    throw new Error("FIREBASE_CREDENTIALS incompleto");
  }

  if (!admin.apps.length) {
    adminInstance = admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } else {
    adminInstance = admin.app();
  }

  dbInstance = adminInstance.database();
  return { db: dbInstance, admin: adminInstance };
};

const { db, admin: firebaseAdmin } = initializeFirebase();

export { db, firebaseAdmin as admin };
