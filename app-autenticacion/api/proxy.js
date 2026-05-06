import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://sii.celaya.tecnm.mx',
        changeOrigin: true,
        rewrite: (path) => '/api/login',
      },
      '/api/movil': {
        target: 'https://sii.celaya.tecnm.mx',
        changeOrigin: true,
      }
    }
  }
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Método ${req.method} no permitido. Usa POST.` });
  }

  try {
    const response = await fetch("https://sii.celaya.tecnm.mx/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(typeof req.body === 'string' ? JSON.parse(req.body) : req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en el proxy:", error);
    res.status(500).json({ error: "Error interno al conectar con el servidor del TecNM" });
  }
}
