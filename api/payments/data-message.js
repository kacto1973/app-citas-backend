import { sendMessage } from "../../twilioFunctions.js";
import cors from "../_middlewares/cors.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

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
