import twilio from "twilio";

const accountSid = "AC4d5e5aa00d52cbfdb890cc37df23cc23";
const authToken = "9c0d19feb52f7545cf81edee35dff7d8";

const client = twilio(accountSid, authToken);

export const sendMessage = async (phoneNumber, message) => {
  try {
    const messageSent = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // El número de teléfono de Twilio que usas
      to: `whatsapp:+521${phoneNumber}`, // El número de teléfono del cliente
    });
    console.log("Mensaje enviado:", messageSent.sid);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
};
