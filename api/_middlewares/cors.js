// _middlewares/cors.js
export default async function cors(req, res) {
  console.log("🟢 CORS middleware ejecutado para:", req.method, req.url);

  // Configurar headers de CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Si es OPTIONS, responder inmediatamente
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // Indica que la request fue manejada
  }

  return false; // Indica que debe continuar con el handler
}
