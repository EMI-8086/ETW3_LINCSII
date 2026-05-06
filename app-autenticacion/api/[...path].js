export default async function handler(req, res) {
  try {
    const path = req.query.path || [];
    const endpoint = path.join('/');

    const url = `https://sii.celaya.tecnm.mx/api/${endpoint}`;
    console.log("Request a:", url);

    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
      body: req.method !== 'GET'
        ? JSON.stringify(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
        : undefined,
    });

    const data = await response.text();

    res.status(response.status).send(data);

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Error en proxy", detail: error.message });
  }
}