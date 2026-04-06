import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const siteUrl = 'https://nexobase.dev';
const lastmod = new Date().toISOString();

const routes = [
  '/',
  '/aviso-legal/',
  '/politica-privacidad/',
  '/politica-cookies/',
  '/condiciones/',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route === '/' ? '/' : route}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

await mkdir(publicDir, { recursive: true });
await writeFile(sitemapPath, sitemap, 'utf8');
console.log(`Generated sitemap at ${sitemapPath}`);
