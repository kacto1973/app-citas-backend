// firebaseFunctions.js
//import admin from "./firebaseConfig.js"; // Importa la configuración ya inicializada
import database from "./firebaseConfig.js"; // Importa la configuración ya inicializada
import { ref, update, get, set } from "firebase/database";

export async function updateTrialExpirationDate(business_id) {
  const path = `businesses/${business_id}`;

  try {
    const trialExpRef = ref(database, `${path}/settings`);

    //obtenemos el iso string de la fecha que acaba de expirar
    const trialExpSnap = await get(trialExpRef);

    if (trialExpSnap.exists()) {
      // const trialExpDate = new Date(trialExpSnap.val().trialEnd);
      // const newTrialExpDate = new Date(
      //   trialExpDate.setMonth(trialExpDate.getMonth() + 1)
      // ).toISOString();

      const newTrialExpDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ).toISOString();

      await update(trialExpRef, { trialEnd: newTrialExpDate });

      console.log(
        `Fecha de expiración de prueba actualizada correctamente a ${newTrialExpDate} para el negocio con id de ${business_id}`
      );
    } else {
      console.log("No se encontró la fecha de expiración de prueba");
    }
  } catch (error) {
    console.error(
      "Error actualizando la fecha de expiración de la prueba: ",
      error
    );
  }
}

export async function testWrite() {
  const testRef = ref(database, "testNode");
  try {
    await set(testRef, { testKey: "testValue" });
    console.log("Escritura exitosa en testNode");
  } catch (error) {
    console.error("Error escribiendo en testNode:", error);
  }
}

export async function getAccessToken(business_id) {
  try {
    const accessTokenRef = ref(database, `businesses/${business_id}/mp_at`);

    const accessTokenSnap = await get(accessTokenRef);
    if (accessTokenSnap.exists()) {
      return accessTokenSnap.val();
    }
  } catch (error) {}
}

export async function updateAppointmentState(
  appointmentId,
  newState,
  downPaymentAmount,
  business_id
) {
  console.log("Database initialized:", database !== undefined);
  console.log("Nuevo estado a actualizar:", newState);

  const path = `businesses/${business_id}`;

  const appointmentRef = ref(
    database,
    `${path}/activeAppointments/${appointmentId}`
  );

  console.log(
    "la path entera que llego al update appointment state: ",
    `${path}/activeAppointments/${appointmentId}`
  );

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

      const totalCost = await get(
        ref(database, `${path}/activeAppointments/${appointmentId}/totalCost`)
      );

      const newTotalCost = totalCost.val() - downPaymentAmount;

      //await update(appointmentRef, { state: newState });
      await update(
        ref(database, `${path}/activeAppointments/${appointmentId}`),
        {
          totalCost: newTotalCost,
        }
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

export const findAppointmentById = async (appointmentId, business_id) => {
  try {
    const path = `businesses/${business_id}`;

    const appointmentsRef = ref(database, `${path}/activeAppointments`);

    const appointmentsSnap = await get(appointmentsRef);

    if (appointmentsSnap.exists()) {
      const appointmentsArray = Object.values(appointmentsSnap.val());
      const foundAppointment = appointmentsArray.find(
        (appointment) => appointment.id === appointmentId
      );

      if (foundAppointment) {
        return foundAppointment; // Retorna el objeto completo.
      }
    }

    console.log("No se encontró una cita con ese ID: " + appointmentId);
    return false;
  } catch (error) {
    console.error("Error al fetchear appointment por ID: " + error.message);
    return false;
  }
};
