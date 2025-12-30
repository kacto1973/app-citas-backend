import { db } from '../../lib/firebase-admin.js';
import cors from '../_middlewares/cors.js';

async function handler(req, res) {
  const path = 'businesses/mb_salon/clients';
  
  // GET - Obtener todos los clientes
  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(path).once('value');
      
      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientsArray = Object.entries(clients).map(([id, client]) => ({
          id,
          ...client
        }));
        
        return res.status(200).json({
          success: true,
          data: clients,
          array: clientsArray,
          count: clientsArray.length
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {},
          array: [],
          count: 0,
          message: 'No hay clientes registrados'
        });
      }
    } catch (error) {
      console.error('Error en getAllClients:', error);
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