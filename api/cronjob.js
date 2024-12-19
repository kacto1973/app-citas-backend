// import { ref, get, remove } from "firebase/database";
// import database from "../firebaseConfig.js";

// /*
// Cron job para limpiar:
// 1. Citas no pagadas en 24 horas.
// 2. Citas con más de 7 días de antigüedad.
// 3. Días de descanso (restdays) que ya hayan pasado.
// */

// export default async function handler(req, res) {
//   const now = new Date();

//   // Calculamos la fecha de 7 días atrás
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(now.getDate() - 7);
//   const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

//   try {
//     const businessesRef = ref(database, "businesses");
//     const businessesSnap = await get(businessesRef);

//     if (businessesSnap.exists()) {
//       const businesses = Object.entries(businessesSnap.val());

//       // Iterar sobre cada negocio
//       for (const [businessID, business] of businesses) {
//         console.log(`Procesando negocio: ${businessID}`);

//         // Limpieza de citas activas
//         const appointmentsRef = ref(
//           database,
//           `businesses/${businessID}/activeAppointments`
//         );
//         const appointmentsSnap = await get(appointmentsRef);

//         if (appointmentsSnap.exists()) {
//           const appointments = Object.entries(appointmentsSnap.val());

//           for (const [appointmentID, appointment] of appointments) {
//             const createdAt = new Date(appointment.createdAt);
//             const diffInHours = (now - createdAt) / (1000 * 60 * 60);

//             // Eliminar citas no pagadas después de 24 horas
//             if (appointment.state === "no pagado" && diffInHours >= 24) {
//               await remove(
//                 ref(
//                   database,
//                   `businesses/${businessID}/activeAppointments/${appointmentID}`
//                 )
//               );
//               console.log(
//                 `Cita ${appointmentID} eliminada en negocio ${businessID} por falta de anticipo.`
//               );
//               continue;
//             }

//             // Eliminar citas con más de 7 días de antigüedad
//             if (appointment.selectedDate < sevenDaysAgoFormatted) {
//               await remove(
//                 ref(
//                   database,
//                   `businesses/${businessID}/activeAppointments/${appointmentID}`
//                 )
//               );
//               console.log(
//                 `Cita ${appointmentID} eliminada en negocio ${businessID} por antigüedad.`
//               );
//             }
//           }
//         }

//         // Limpieza de días de descanso (restdays)
//         const restdaysRef = ref(database, `businesses/${businessID}/restdays`);
//         const restdaysSnap = await get(restdaysRef);

//         if (restdaysSnap.exists()) {
//           const restdays = Object.entries(restdaysSnap.val());
//           const todayFormatted = now.toISOString().split("T")[0];

//           for (const [restdayID, restday] of restdays) {
//             if (restday < todayFormatted) {
//               await remove(
//                 ref(database, `businesses/${businessID}/restdays/${restdayID}`)
//               );
//               console.log(
//                 `Día de descanso ${restdayID} eliminado en negocio ${businessID} por antigüedad.`
//               );
//             }
//           }
//         }
//       }
//     }

//     console.log("Limpieza completada para todos los negocios.");
//     return res.status(200).json({
//       message: "Limpieza de citas y días de descanso ejecutada correctamente.",
//     });
//   } catch (error) {
//     console.error("Error en limpieza:", error);
//     return res.status(500).json({ error: "Error en limpieza." });
//   }
// }

import { ref, get, remove, update } from "firebase/database";
import database from "../firebaseConfig.js";

export default async function handler(req, res) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

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
          ref(database, `businesses/${businessID}/activeAppointments`)
        );

        if (appointmentsSnap.exists()) {
          const appointments = Object.entries(appointmentsSnap.val());

          for (const [appointmentID, appointment] of appointments) {
            const createdAt = new Date(appointment.createdAt);
            const diffInHours = (now - createdAt) / (1000 * 60 * 60);

            // Eliminar citas no pagadas después de 24 horas
            if (appointment.state === "no pagado" && diffInHours >= 24) {
              updates[
                `businesses/${businessID}/activeAppointments/${appointmentID}`
              ] = null;
              console.log(
                `Cita ${appointmentID} eliminada en negocio ${businessID} por falta de anticipo.`
              );
              continue;
            }

            // Eliminar citas con más de 7 días de antigüedad
            if (appointment.selectedDate < sevenDaysAgoFormatted) {
              updates[
                `businesses/${businessID}/activeAppointments/${appointmentID}`
              ] = null;
              console.log(
                `Cita ${appointmentID} eliminada en negocio ${businessID} por antigüedad.`
              );
            }
          }
        }

        // Leer días de descanso (restdays) del negocio
        const restdaysSnap = await get(
          ref(database, `businesses/${businessID}/restdays`)
        );

        if (restdaysSnap.exists()) {
          const restdays = Object.entries(restdaysSnap.val());
          const todayFormatted = now.toISOString().split("T")[0];

          for (const [restdayID, restday] of restdays) {
            if (restday < todayFormatted) {
              updates[`businesses/${businessID}/restdays/${restdayID}`] = null;
              console.log(
                `Día de descanso ${restdayID} eliminado en negocio ${businessID} por antigüedad.`
              );
            }
          }
        }

        // Fin del monitoreo de tiempo por negocio
        const businessEndTime = process.hrtime(businessStartTime);
        console.log(
          `Negocio ${businessID} procesado en ${
            businessEndTime[0]
          } segundos y ${businessEndTime[1] / 1e6} milisegundos.`
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
      } milisegundos.`
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
      } milisegundos.`
    );

    return res.status(500).json({
      error: "Error en limpieza.",
      executionTime: `${endTime[0]} segundos y ${
        endTime[1] / 1e6
      } milisegundos.`,
    });
  }
}
