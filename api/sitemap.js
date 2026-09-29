// /sitemap.xml — páginas do site + landing pages públicas e indexáveis da EVORAH (sem deploy para novas páginas).
import { EVORAH_LANDINGS } from './lp.js';
const SITE = 'https://www.paibrunovieira.com.br';
export const PAGES = ['/', '/politica'];
export default async function handler(_req, res) {
  let landings = [];
  try { const response = await fetch(`${EVORAH_LANDINGS}/sitemap`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(6000) }); if (response.ok) landings = ((await response.json()).pages || []).filter((page) => typeof page.slug === 'string' && /^[a-z0-9-]{1,80}$/.test(page.slug)); } catch { /* só as páginas do site */ }
  const urls = [...PAGES.map((path) => `<url><loc>${SITE}${path}</loc></url>`), ...landings.map((page) => `<url><loc>${SITE}/${page.slug}</loc>${page.updatedAt ? `<lastmod>${String(page.updatedAt).slice(0, 10)}</lastmod>` : ''}</url>`)];
  res.statusCode = 200; res.setHeader('Content-Type', 'application/xml; charset=utf-8'); res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
  res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
}
