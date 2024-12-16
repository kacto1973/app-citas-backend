// firebaseFunctions.js
//import admin from "./firebaseConfig.js"; // Importa la configuración ya inicializada
import database from "./firebaseConfig.js"; // Importa la configuración ya inicializada
import { ref, update, get, set } from "firebase/database";

export async function testWrite() {
  const testRef = ref(database, "testNode");
  try {
    await set(testRef, { testKey: "testValue" });
    console.log("Escritura exitosa en testNode");
  } catch (error) {
    console.error("Error escribiendo en testNode:", error);
  }
}

export async function updateAppointmentState(appointmentId, newState) {
  console.log("Database initialized:", database !== undefined);
  console.log("Nuevo estado a actualizar:", newState);

  const appointmentRef = ref(database, `activeAppointments/${appointmentId}`);

  try {
    // Actualiza el estado
    await update(appointmentRef, { state: newState });

    // Verificación adicional
    const updatedAppointment = await get(appointmentRef);
    const updatedState = updatedAppointment.val()?.state;

    // Verifica si el estado fue actualizado correctamente
    if (updatedState === newState) {
      console.log(
        `Estado de la cita con ID ${appointmentId} actualizado correctamente a ${newState}`
      );
      return true;
    } else {
      console.error(
        `Error: El estado de la cita con ID ${appointmentId} no se actualizó correctamente.`
      );
      return false;
    }
  } catch (error) {
    console.error("Error actualizando el estado de la cita: ", error);
    return false;
  }
}
