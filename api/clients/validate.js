import { db } from '../../lib/firebase-admin.js';
import cors from '../_middlewares/cors.js';

async function handler(req, res) {
  // POST - Validar cliente por teléfono
  if (req.method === 'POST') {
    try {
      const { cellphone } = req.body;
      
      if (!cellphone) {
        return res.status(400).json({
          success: false,
          error: 'Número de teléfono requerido'
        });
      }
      
      const path = 'businesses/mb_salon/clients';
      const snapshot = await db.ref(path)
        .orderByChild('cellphone')
        .equalTo(cellphone)
        .once('value');
      
      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientId = Object.keys(clients)[0];
        const clientData = clients[clientId];
        
        return res.status(200).json({
          success: true,
          clientExists: true,
          client: {
            id: clientId,
            ...clientData
          }
        });
      } else {
        return res.status(200).json({
          success: true,
          clientExists: false,
          message: 'Cliente no encontrado'
        });
      }
      
    } catch (error) {
      console.error('Error en validateClient:', error);
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