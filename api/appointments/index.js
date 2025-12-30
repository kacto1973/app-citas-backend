import { db } from '../../lib/firebase-admin.js';
import cors from '../_middlewares/cors.js';

async function handler(req, res) {
  const path = 'businesses/mb_salon/activeAppointments';
  
  // GET - Obtener todas las citas
  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(path).once('value');
      
      if (snapshot.exists()) {
        const appointments = snapshot.val();
        const appointmentsArray = Object.entries(appointments).map(([id, apt]) => ({
          id,
          ...apt
        }));
        
        return res.status(200).json({
          success: true,
          data: appointments,
          array: appointmentsArray,
          count: appointmentsArray.length
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {},
          array: [],
          count: 0,
          message: 'No hay citas activas'
        });
      }
    } catch (error) {
      console.error('Error en getAppointments:', error);
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