import { ref, get, remove, update } from "firebase/database";
import { db as database } from "../../lib/firebase-admin.js";
import { DateTime } from "luxon";
import cors from "../../_middlewares/cors.js";

export default async function handler(req, res) {
  await cors(req, res);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];
  //const todayFormatted = now.toISOString().split("T")[0];

  //logica aparte usando luxon
  const localTime = DateTime.now().setZone("America/Hermosillo");
  const localTimeFormatted = localTime.toFormat("yyyy-MM-dd");

  console.log("Cron job iniciado...");

  // Inicio del monitoreo de tiempo total
  const startTime = process.hrtime();

  try {
    const businessesRef = ref(database, "businesses");
    const businessesSnap = await get(businessesRef);

    if (businessesSnap.exists()) {
      const businesses = Object.entries(businessesSnap.val());
      const updates = {}; // Para operaciones en lote

      for (const [businessID, business] of businesses) {
        console.log(`Procesando negocio: ${businessID}`);

        // Inicio del monitoreo de tiempo por negocio
        const businessStartTime = process.hrtime();

        // Leer citas activas del negocio
        const appointmentsSnap = await get(
          ref(database, `businesses/${businessID}/activeAppointments`),
        );

        if (appointmentsSnap.exists()) {
          const appointments = Object.entries(appointmentsSnap.val());

          for (const [appointmentID, appointment] of appointments) {
            // Eliminar citas con más de 7 días de antigüedad
            if (appointment.selectedDate < sevenDaysAgoFormatted) {
              updates[
                `businesses/${businessID}/activeAppointments/${appointmentID}`
              ] = null;
              console.log(
                `Cita ${appointmentID} eliminada en negocio ${businessID} por antigüedad.`,
              );
            }

            const creationDate = DateTime.fromISO(appointment.createdAt)
              .setZone("America/Hermosillo") // Asegura que use la zona horaria de Hermosillo
              .toFormat("yyyy-MM-dd");

            const theDayAfter = DateTime.fromISO(appointment.createdAt)
              .setZone("America/Hermosillo") // Asegura que use la misma zona horaria
              .plus({ days: 1 }) // Añade un día
              .toFormat("yyyy-MM-dd");

            if (
              appointment.selectedDate === creationDate ||
              appointment.selectedDate === theDayAfter
            ) {
              console.log(
                "cita creada y seleccionada para el mismo dia o el dia siguiente, no se elimina",
              );
              continue;
            }

            console.log(
              "la cita se creo en un dia distinto al seleccionado (no es intradia)",
            );

            const createdAt = new Date(appointment.createdAt);
            const diffInHours = (now - createdAt) / (1000 * 60 * 60);

            console.log("procesando cita", appointmentID);
            console.log("creada en", createdAt);
            console.log("diferencia en horas", diffInHours);

            // Eliminar citas no pagadas después de 12 horas
            if (appointment.state === "no pagado" && diffInHours >= 12) {
              console.log(
                "es una cita no pagada y tiene más de 12 horas, se elimina",
              );

              updates[
                `businesses/${businessID}/activeAppointments/${appointmentID}`
              ] = null;
              console.log(
                `Cita ${appointmentID} eliminada en negocio ${businessID} por falta de anticipo.`,
              );
              continue;
            }

            console.log("No se ha pagado, pero no han pasado las 12 horas");
          }
        }

        // Leer días de descanso (restdays) del negocio
        const restdaysSnap = await get(
          ref(database, `businesses/${businessID}/restdays`),
        );

        if (restdaysSnap.exists()) {
          const restdays = Object.entries(restdaysSnap.val());
          const todayFormatted = now.toISOString().split("T")[0];

          for (const [restdayID, restday] of restdays) {
            if (restday < todayFormatted) {
              updates[`businesses/${businessID}/restdays/${restdayID}`] = null;
              console.log(
                `Día de descanso ${restdayID} eliminado en negocio ${businessID} por antigüedad.`,
              );
            }
          }
        }

        // Fin del monitoreo de tiempo por negocio
        const businessEndTime = process.hrtime(businessStartTime);
        console.log(
          `Negocio ${businessID} procesado en ${
            businessEndTime[0]
          } segundos y ${businessEndTime[1] / 1e6} milisegundos.`,
        );
      }

      // Aplicar todas las actualizaciones en un solo paso
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        console.log("Actualizaciones aplicadas en lote.");
      }
    }

    // Fin del monitoreo de tiempo total
    const endTime = process.hrtime(startTime);
    console.log(
      `Cron job completado en ${endTime[0]} segundos y ${
        endTime[1] / 1e6
      } milisegundos.`,
    );

    return res.status(200).json({
      message: "Limpieza de citas y días de descanso ejecutada correctamente.",
      executionTime: `${endTime[0]} segundos y ${
        endTime[1] / 1e6
      } milisegundos.`,
    });
  } catch (error) {
    console.error("Error en limpieza:", error);

    // Fin del monitoreo en caso de error
    const endTime = process.hrtime(startTime);
    console.log(
      `Cron job falló después de ${endTime[0]} segundos y ${
        endTime[1] / 1e6
      } milisegundos.`,
    );

    return res.status(500).json({
      error: "Error en limpieza.",
      executionTime: `${endTime[0]} segundos y ${
        endTime[1] / 1e6
      } milisegundos.`,
    });
  }
}
