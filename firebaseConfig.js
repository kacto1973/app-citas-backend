import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database"; // Importa getDatabase desde el módulo de base de datos

// Carga el archivo de clave privada
import serviceAccount from "./config/citas-app-7d6e1-firebase-adminsdk-8hlxx-a0b7cd5c54.json" assert { type: "json" };

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://citas-app-7d6e1-default-rtdb.firebaseio.com", // Cambia esto por el URL de tu Realtime Database
});

// Exporta la referencia a la base de datos
const database = getDatabase();
export default database;
