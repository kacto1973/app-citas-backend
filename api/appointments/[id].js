import { db } from '../../../lib/firebase-admin.js';
import cors from '../../_middlewares/cors.js';

async function handler(req, res) {
  const { id } = req.query; // Vercel pasa parámetros dinámicos en req.query
  const path = `businesses/mb_salon/activeAppointments`;
  
  // GET - Buscar cita por ID
  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(`${path}/${id}`).once('value');
      
      if (snapshot.exists()) {
        return res.status(200).json({
          success: true,
          data: {
            id,
            ...snapshot.val()
          }
        });
      } else {
        // Buscar en todas las citas (por si el ID está en el objeto)
        const allSnap = await db.ref(path).once('value');
        if (allSnap.exists()) {
          const appointments = allSnap.val();
          const foundAppointment = Object.entries(appointments).find(([key, apt]) => 
            apt.id === id || key === id
          );
          
          if (foundAppointment) {
            return res.status(200).json({
              success: true,
              data: {
                id: foundAppointment[0],
                ...foundAppointment[1]
              }
            });
          }
        }
        
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }
    } catch (error) {
      console.error('Error en findAppointmentById:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
  
  // DELETE - Cancelar cita
  if (req.method === 'DELETE') {
    try {
      await db.ref(`${path}/${id}`).remove();
      
      return res.status(200).json({
        success: true,
        message: 'Cita eliminada exitosamente'
      });
      
    } catch (error) {
      console.error('Error en cancelAppointment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
  
  // GET expiración de cita
  if (req.method === 'GET' && req.query.action === 'expiration') {
    try {
      const snapshot = await db.ref(`${path}/${id}`).once('value');
      
      if (snapshot.exists()) {
        const appointment = snapshot.val();
        return res.status(200).json({
          success: true,
          expiresAt: appointment.expiresAt
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }
    } catch (error) {
      console.error('Error en getAppointmentExpirationTime:', error);
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