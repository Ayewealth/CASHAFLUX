import { type Express } from 'express'
import { createServer as createViteServer } from 'vite'
import { type Server } from 'http'
import fs from 'fs'
import path from 'path'
import viteConfig from '../../vite.config'

export async function setupVite(httpServer: Server, app: Express) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: 'custom',
  })

  // Serve all Vite-handled assets (JS, CSS, HMR websocket, etc.)
  app.use(vite.middlewares)

  // SPA fallback: transform and serve index.html for every non-API route
  app.use('/{*path}', async (req, res, next) => {
    try {
      const template = await fs.promises.readFile(
        path.resolve(process.cwd(), 'index.html'),
        'utf-8',
      )
      const page = await vite.transformIndexHtml(req.originalUrl, template)
      res.status(200).set('Content-Type', 'text/html').end(page)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })
}
