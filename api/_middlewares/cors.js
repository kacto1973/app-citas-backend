// lib/cors.js
import Cors from "cors";

const cors = Cors({
  origin:
    process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS : "*", // desarrollo: todo permitido
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Helper para que funcione en serverless
export default function runCors(req, res) {
  console.log("🟢 CORS ejecutado");

  return new Promise((resolve, reject) => {
    cors(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
