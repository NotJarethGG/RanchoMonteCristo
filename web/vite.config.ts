import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
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

/**
 * HTML de la versión en inglés (/en). El SPA traduce la página al cargar,
 * pero los rastreadores de redes no ejecutan JavaScript, y para Google es
 * mejor que cada versión traiga desde el HTML su idioma, título y canonical.
 * Se arma a partir del index.html ya compilado, así comparte los mismos
 * archivos de JS y CSS. Si un texto de acá deja de existir en index.html, el
 * build falla en lugar de publicar una versión a medio traducir.
 */
function htmlEnIngles(html: string, siteUrl: string) {
  const cambios: [string, string][] = [
    ['<html lang="es">', '<html lang="en">'],
    [
      '<title>Rancho Montecristo | Alquiler para eventos en Nicoya</title>',
      '<title>Rancho Montecristo | Event venue rental in Nicoya, Costa Rica</title>',
    ],
    [
      'content="Alquilá el Rancho Montecristo completo en Nicoya, Guanacaste: cumpleaños, bodas, reuniones familiares y eventos de empresa. Rancho techado, áreas verdes y parqueo privado."',
      'content="Rent all of Rancho Montecristo in Nicoya, Guanacaste, Costa Rica: birthdays, weddings, family gatherings and company events. Covered pavilion, green areas and private parking."',
    ],
    [`<link rel="canonical" href="${siteUrl}/" />`, `<link rel="canonical" href="${siteUrl}/en" />`],
    ['<meta property="og:locale" content="es_CR" />', '<meta property="og:locale" content="en_US" />'],
    [
      '<meta property="og:locale:alternate" content="en_US" />',
      '<meta property="og:locale:alternate" content="es_CR" />',
    ],
    [`<meta property="og:url" content="${siteUrl}/" />`, `<meta property="og:url" content="${siteUrl}/en" />`],
    [
      '<meta property="og:title" content="Rancho Montecristo · Alquiler para eventos en Nicoya" />',
      '<meta property="og:title" content="Rancho Montecristo · Event venue rental in Nicoya, Costa Rica" />',
    ],
    [
      'content="Un rancho entero, solo para tu gente. Alquiler del rancho completo para eventos en Nicoya, Guanacaste."',
      'content="A whole ranch, just for your group. Rent the entire ranch for your event in Nicoya, Guanacaste, Costa Rica."',
    ],
    [
      'content="Logo de Rancho Montecristo: el Cristo sobre el cerro"',
      'content="Rancho Montecristo logo: the statue of Christ on the hill"',
    ],
    [
      '<meta name="twitter:title" content="Rancho Montecristo · Alquiler para eventos en Nicoya" />',
      '<meta name="twitter:title" content="Rancho Montecristo · Event venue rental in Nicoya, Costa Rica" />',
    ],
    [
      'Rancho Montecristo — alquiler para eventos en Nicoya, Guanacaste. Este sitio necesita\n        JavaScript para mostrar la disponibilidad y el formulario de reserva.',
      'Rancho Montecristo — event venue rental in Nicoya, Guanacaste, Costa Rica. This site needs\n        JavaScript to show availability and the booking form.',
    ],
  ]

  return cambios.reduce((out, [de, a]) => {
    if (!out.includes(de)) throw new Error(`Versión en inglés: no se encontró en index.html:\n  ${de}`)
    return out.replace(de, a)
  }, html)
}

function seo(siteUrl: string, apiOrigin: string | null): Plugin {
  let outDir = 'dist'

  return {
    name: 'rancho-seo',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },

    writeBundle() {
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      fs.mkdirSync(path.join(outDir, 'en'), { recursive: true })
      fs.writeFileSync(path.join(outDir, 'en', 'index.html'), htmlEnIngles(html, siteUrl))
    },

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

      // Cada versión declara a la otra (hreflang), como pide Google.
      const hoy = new Date().toISOString().slice(0, 10)
      const alternas =
        `    <xhtml:link rel="alternate" hreflang="es" href="${siteUrl}/" />\n` +
        `    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en" />\n` +
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/" />\n`
      const url = (loc: string, prioridad: string) =>
        `  <url>\n    <loc>${loc}</loc>\n${alternas}` +
        `    <lastmod>${hoy}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n    <priority>${prioridad}</priority>\n  </url>\n`

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
          url(`${siteUrl}/`, '1.0') +
          url(`${siteUrl}/en`, '0.8') +
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
