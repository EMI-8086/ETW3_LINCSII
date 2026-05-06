export default async function handler(req, res) {
  const response = await fetch('https://sii.celaya.tecnm.mx/api/movil/estudiante', {
    headers: { 'Authorization': req.headers.authorization }
  });
  const data = await response.json();
  res.status(response.status).json(data);
}