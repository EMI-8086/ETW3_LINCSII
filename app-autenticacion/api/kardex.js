// api/kardex.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Usando la ruta exacta de la documentación
    const response = await fetch('https://sii.celaya.tecnm.mx/api/movil/estudiante/kardex', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Kardex error:', error);
    res.status(500).json({ error: 'Error al obtener kardex' });
  }
}