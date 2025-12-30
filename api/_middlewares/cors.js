// lib/cors.js
export default function cors(handler) {
  return async (req, res) => {
    // Determinar origen permitido basado en entorno
    const allowedOrigin = process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS // Solo tu dominio en producción
      : '*'; // Todo en desarrollo
      
  
    // Configurar headers
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    return handler(req, res);
  };
}