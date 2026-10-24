import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // In dev, /api/* is forwarded to the Flask backend (python run.py), so no CORS setup is needed.
  server: { port: 5173, open: true, proxy: { '/api': 'http://localhost:5000' } },
});
