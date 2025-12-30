import { db } from '../../lib/firebase-admin.js';
import cors from '../_middlewares/cors.js';

async function handler(req, res) {
  const path = 'businesses/mb_salon/menu/services';
  
  // GET - Obtener todos los servicios
  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(path).once('value');
      
      if (snapshot.exists()) {
        return res.status(200).json({
          success: true,
          data: snapshot.val(),
          count: Object.keys(snapshot.val()).length
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {},
          count: 0,
          message: 'No hay servicios disponibles'
        });
      }
    } catch (error) {
      console.error('Error en getServices:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
  
  return res.status(405).json({
    success: false,
    error: 'Método no permitido'
  });
}

export default cors(handler);