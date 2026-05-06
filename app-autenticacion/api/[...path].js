export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 🔥 dinámica: permite diferentes endpoints
    const endpoint = req.query.path?.join('/') || 'login';

    const response = await fetch(`https://sii.celaya.tecnm.mx/api/${endpoint}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.method !== 'GET'
        ? JSON.stringify(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
        : undefined,
    });

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error en proxy" });
  }
}