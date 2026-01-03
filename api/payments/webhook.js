import {
  updateAppointmentState,
  updateTrialExpirationDate,
} from "../../webhookFunctions.js";
import { sendMessage } from "../../twilioFunctions.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const paymentId = req.body?.data?.id;

      if (!paymentId) {
        return res.status(400).json({ error: "El campo 'id' es obligatorio" });
      }

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      const paymentData = await response.json();

      if (response.ok) {
        if (paymentData.status === "approved") {
          //extraemos el tipo de solicitud, esto lo incluimos en solicitudes
          //de pago unico y de suscripción para poder diferenciarlas
          const { type } = JSON.parse(paymentData.external_reference);

          if (type === "subscription") {
            //ejecutamos logica de suscripcion
            const { business_id } = JSON.parse(paymentData.external_reference);

            await updateTrialExpirationDate(business_id);
          } else if (type === "unique_payment") {
            //ejecutamos logica de paog unico
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

            // await sendMessage(
            //   "6624237920",
            //   "Se ha recibido un nuevo anticipo:\n" +
            //     `• Monto de: $${paidAmount}\n` +
            //     `• Por parte de: ${appointment.userFullName}\n` +
            //     `• Para la cita el día: ${appointment.selectedDate}\n` +
            //     `• A las: ${appointment.selectedTime}`
            // );
          }
        } else if (paymentData.status === "pending") {
          console.log("Pago pendiente que estas probando orita: ", paymentData);
        } else {
          console.log(
            "Pago rechazado o en otro estado probando orita: ",
            paymentData
          );
        }

        ////////////////
      } else {
        console.error("Error al consultar el pago: ", paymentData);
        res.status(500).send("Error al consultar el estado del pago");
      }

      ////////////////
    } catch (error) {
      console.error("Error procesando el webhook: ", error);
      res.status(500).json({ error: "Error procesando el webhook" });
    }

    ///////////////////////////
    res.status(200).send("Webhook procesado correctamente");
  } else {
    res.status(405).send("Método no permitido, eso no es una solicitud POST");
  }
}
