export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path } = req.query;
    const endpoint = Array.isArray(path) ? path.join('/') : (path || '');
    
    const apiUrl = `https://sii.celaya.tecnm.mx/api/${endpoint}`;
    
    console.log(`[Proxy] ${req.method} ${apiUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    
    const fetchOptions = {
      method: req.method,
      headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      fetchOptions.body = JSON.stringify(bodyData);
    }
    
    const response = await fetch(apiUrl, fetchOptions);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ 
      error: 'Error en el proxy',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}