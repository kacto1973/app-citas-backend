import { db } from '../../../lib/firebase-admin.js';
import cors from '../../_middlewares/cors.js';

async function handler(req, res) {
  const { phone } = req.query;
  const path = 'businesses/mb_salon/clients';
  
  // GET - Buscar cliente por número de teléfono
  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(path)
        .orderByChild('cellphone')
        .equalTo(phone)
        .once('value');
      
      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientId = Object.keys(clients)[0];
        const clientData = clients[clientId];
        
        return res.status(200).json({
          success: true,
          client: {
            id: clientId,
            ...clientData
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }
      
    } catch (error) {
      console.error('Error en findClientByPhoneNumber:', error);
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