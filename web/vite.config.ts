import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * URL pública del sitio, para canonical, Open Graph, robots.txt y sitemap.
 * Vercel expone VERCEL_PROJECT_PRODUCTION_URL en cada build (también en los
 * previews, que así apuntan su canonical a producción y no compiten con ella),
 * y se actualiza sola si mañana se conecta un dominio propio.
 */
function resolveSiteUrl(env: Record<string, string>) {
  const url =
    env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:5173')
  return url.replace(/\/$/, '')
}

/**
 * Política de seguridad de contenido. Se genera en el build a partir de la
 * URL de la API, así que no hay un dominio escrito a mano que se desactualice.
 * Es la defensa principal del token de sesión (vive en localStorage): aunque
 * se colara HTML, el navegador no ejecutaría scripts ajenos ni enviaría datos
 * a otros orígenes.
 */
function contentSecurityPolicy(apiOrigin: string) {
  return [
    "default-src 'self'",
    "script-src 'self'",
    // 'unsafe-inline' en estilos: sonner inyecta los suyos en tiempo de ejecución.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com ${apiOrigin}`,
    `connect-src 'self' ${apiOrigin}`,
    'frame-src https://www.openstreetmap.org https://www.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')
}

function seo(siteUrl: string, apiOrigin: string | null): Plugin {
  return {
    name: 'rancho-seo',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let out = html.replaceAll('%SITE_URL%', siteUrl)

        // Solo en el build: en desarrollo, Vite necesita scripts en línea para
        // la recarga en caliente y la CSP los bloquearía.
        if (!ctx.server && apiOrigin) {
          out = out.replace(
            '<meta charset="UTF-8" />',
            `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(apiOrigin)}" />\n    <link rel="preconnect" href="${apiOrigin}" crossorigin />`,
          )
        }
        return out
      },
    },

    generateBundle() {
      // /admin no se bloquea acá a propósito: si robots.txt lo prohíbe, Google
      // no puede leer la cabecera `noindex` y podría indexar la URL igual.
      // El noindex lo pone vercel.json para todo /admin.
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url>\n    <loc>${siteUrl}/</loc>\n` +
          `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n` +
          '    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
          '</urlset>\n',
      })
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // En desarrollo el proxy de abajo resuelve /api, pero en un build de
  // producción no hay proxy: sin esta variable el sitio se publica llamando a
  // su propio dominio y falla al cargar. Mejor que reviente acá.
  if (command === 'build' && mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      '\n\n  Falta VITE_API_URL.\n\n' +
        '  Es la URL del backend Laravel, terminada en /api. Por ejemplo:\n' +
        '    VITE_API_URL=https://ranchomontecristo.onrender.com/api\n\n' +
        '  En Vercel: Settings -> Environment Variables (marcala para Production)\n' +
        '  y redesplegá SIN caché: las variables VITE_ se incrustan al compilar,\n' +
        '  así que un build existente no las toma.\n',
    )
  }

  const apiOrigin = env.VITE_API_URL ? new URL(env.VITE_API_URL).origin : null

  return {
    plugins: [react(), tailwindcss(), seo(resolveSiteUrl(env), apiOrigin)],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      // En desarrollo el SPA habla con Laravel sin CORS ni URLs absolutas.
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/storage': {
          target: process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
