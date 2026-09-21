import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // En desarrollo el proxy de abajo resuelve /api, pero en un build de
  // producción no hay proxy: sin esta variable el sitio se publica llamando a
  // su propio dominio y falla al cargar. Mejor que reviente acá.
  if (command === "build" && mode === "production" && !env.VITE_API_URL) {
    throw new Error(
      "\n\n  Falta VITE_API_URL.\n\n" +
        "  Es la URL del backend Laravel, terminada en /api. Por ejemplo:\n" +
        "    VITE_API_URL=https://ranchomontecristo.onrender.com/api\n\n" +
        "  En Vercel: Settings -> Environment Variables (marcala para Production)\n" +
        "  y redesplegá SIN caché: las variables VITE_ se incrustan al compilar,\n" +
        "  así que un build existente no las toma.\n",
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      port: 5173,
      // En desarrollo el SPA habla con Laravel sin CORS ni URLs absolutas.
      proxy: {
        "/api": {
          target: process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8000",
          changeOrigin: true,
        },
        "/storage": {
          target: process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8000",
          changeOrigin: true,
        },
      },
    },
  };
});
