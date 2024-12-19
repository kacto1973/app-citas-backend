import {
  updateAppointmentState,
  findAppointmentById,
  testWrite,
} from "../firebaseFunctions.js";
import { sendPaymentReceipt } from "../twilioFunctions.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const paymentId = req.body?.data?.id;

    if (paymentId) {
      try {
        const response = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer TEST-4686380160898466-121322-59ec321e1a8fe1b378d177e6d9419378-238335945`,
            },
          }
        );

        const paymentData = await response.json();

        if (response.ok) {
          //console.log("Respuesta de la API de MercadoPago: ", paymentData);
          //verificamos el estado del pago
          if (paymentData.status === "approved") {
            // console.log("Pago aprobado: ", paymentData);

            // Acceder a external_reference y desestructurarlo
            const { appointmentId, business_id } = JSON.parse(
              paymentData.external_reference
            );
            console.log("Appointment ID:", appointmentId);
            console.log("Business ID:", business_id);

            const paidAmount =
              paymentData.transaction_details.total_paid_amount;
            console.log("Monto pagado:", paidAmount);

            await updateAppointmentState(
              appointmentId,
              "pagado",
              paidAmount,
              business_id
            );

            // const appointment = await findAppointmentById(
            //   paymentData.external_reference, paymentData.business_id
            // );

            // await sendPaymentReceipt(
            //   "6624237920",
            //   "Se ha recibido un nuevo anticipo:\n" +
            //     `• Monto de: $${paidAmount}\n` +
            //     `• Por parte de: ${appointment.userFullName}\n` +
            //     `• Para la cita el día: ${appointment.selectedDate}\n` +
            //     `• A las: ${appointment.selectedTime}`
            // );
          } else if (paymentData.status === "pending") {
            console.log("Pago pendiente: ", paymentData);
          } else {
            console.log("Pago rechazado o en otro estado: ", paymentData);
          }
        } else {
          console.error("Error al consultar el pago: ", paymentData);
          res.status(500).send("Error al consultar el estado del pago");
        }
      } catch (error) {
        console.error("Error al procesar el webhook: ", error);
        res.status(500).send("Error interno del servidor");
      }
    }

    res.status(200).send("Webhook procesado correctamente");
  } else {
    res.status(405).send("Método no permitido, eso no es una solicitud POST");
  }
}
