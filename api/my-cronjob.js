import { ref, get, remove } from "firebase/database";
import database from "../firebaseConfig.js";

export default async function handler(req, res) {
  const appointmentsRef = ref(database, "activeAppointments");
  const now = new Date();

  try {
    const snapshot = await get(appointmentsRef);

    if (snapshot.exists()) {
      const appointments = Object.entries(snapshot.val()); // Convertir snapshot a un array de [key, value]

      // calculamos los 7 dias antes para filtrar posteriormente
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

      for (const [key, appointment] of appointments) {
        const createdAt = new Date(appointment.createdAt);
        const diffInHours = (now - createdAt) / (1000 * 60 * 60);

        // Eliminar citas sin anticipo después de 12 horas
        if (appointment.state === "no pagado" && diffInHours >= 12) {
          await remove(ref(database, `activeAppointments/${key}`));
          console.log(`Cita ${key} eliminada por falta de anticipo.`);
          continue; // Pasar a la siguiente iteración
        }

        //si pasaron el primer filtro ahora checamos citas
        //con anticipo pero mas viejas de 7 dias
        if (appointment.selectedDate < sevenDaysAgoFormatted) {
          await remove(ref(database, `activeAppointments/${key}`));
          console.log(`Cita ${key} eliminada por antigüedad.`);
        }
      }
    }

    // Eliminar restdays pasados, si no son de hoy hacia el futuro, van pa fuera
    const restdaysRef = ref(database, "restdays");
    const restdaysSnapshot = await get(restdaysRef);

    if (restdaysSnapshot.exists()) {
      const restdays = Object.entries(restdaysSnapshot.val());

      for (const [key, restday] of restdays) {
        const today = new Date();
        const todayFormatted = today.toISOString().split("T")[0];

        if (restday < todayFormatted) {
          await remove(ref(database, `restdays/${key}`));
          console.log(`Día ${key} eliminado por antigüedad.`);
        }
      }
    }

    console.log("Limpieza completada.");
    return res.status(200).json({
      message: "Limpieza de citas y restdays ejecutada correctamente.",
    });
  } catch (error) {
    console.error("Error en limpieza:", error);
    return res.status(500).json({ error: "Error en limpieza." });
  }

  //ahora enviamos notifcaciones a las clientas previas a su cita
}
