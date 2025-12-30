import { sendMessage } from "../../twilioFunctions.js";

export default async function handler(req, res) {
  // Permitir solicitudes desde cualquier origen (puedes restringirlo a tu dominio)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Responde a las preflight requests de CORS
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { phoneNumber, message } = req.body;

      await sendMessage(phoneNumber, message);

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message: ", error);
      res.status(500).json({ message: "Error sending message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
