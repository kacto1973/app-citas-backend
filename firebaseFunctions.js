// firebaseFunctions.js
import admin from "./firebaseConfig.js"; // Importa la configuración ya inicializada
const database = admin.database();

// Función para actualizar el estado de una cita
export async function updateAppointmentState(appointmentId, newState) {
  const ref = database.ref(`/activeAppointments/${appointmentId}`);
  try {
    // Actualiza el estado
    await ref.update({ state: newState });

    // Verificación adicional
    const updatedAppointment = await ref.once("value");
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
