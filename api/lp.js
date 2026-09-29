// /{slug} (rewrite em vercel.json) — landing pages criadas na EVORAH (Marketing → Landing Pages) servidas em
// www.paibrunovieira.com.br sem deploy. A EVORAH devolve o conteúdo já renderizado (HTML escapado + CSS com escopo
// .lp); aqui entram só o <head> (SEO/OG), o cabeçalho/rodapé do site e o Meta Pixel já usado pelo site.
// Arquivos existentes (/, /7chaves, /politica, imagens…) têm prioridade sobre esta rota.
export const EVORAH_LANDINGS = 'https://bruno-ai-silk.vercel.app/api/public/landings/paibruno';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const chrome = `<style>.pb-top{display:flex;justify-content:space-between;align-items:center;padding:18px max(16px,calc((100% - 1040px)/2));background:#17231f;color:#f4f1e9;font:700 .95rem 'Libre Baskerville',Georgia,serif;letter-spacing:.06em}.pb-top a{color:inherit;text-decoration:none}.pb-foot{padding:36px 16px;text-align:center;background:#17231f;color:#c9c5b9;font:14px/1.6 'DM Sans',Arial,sans-serif}.pb-foot a{color:inherit}</style>`;
const header = `<header class="pb-top"><a href="/">PAI <i>◆</i> BRUNO</a></header>`;
const footer = `<footer class="pb-foot"><div>PAI ◆ BRUNO</div><p>Terreiro São Miguel · Método Arcano</p><p><a href="/politica">Política de Privacidade</a></p></footer>`;
const pixelCode = (id) => `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script>`;
const notFound = (title = 'Página não encontrada', text = 'O endereço pode ter mudado ou a página não está mais no ar.') => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Pai Bruno Vieira</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg">${chrome}</head><body style="margin:0;background:#f4f1e9;color:#17231f;font:17px/1.6 Georgia,serif">${header}<main style="max-width:640px;margin:80px auto;padding:0 16px"><h1>${title}</h1><p>${text}</p><p><a href="/">Voltar ao início</a></p></main>${footer}</body></html>`;

export function landingHtml(page) {
  const h = page.head;
  const meta = `<title>${esc(h.title)}</title><meta name="description" content="${esc(h.description)}"><link rel="canonical" href="${esc(h.canonical)}"><meta name="robots" content="${esc(h.robots)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Pai Bruno Vieira"><meta property="og:title" content="${esc(h.ogTitle)}"><meta property="og:description" content="${esc(h.ogDescription)}"><meta property="og:url" content="${esc(h.ogUrl)}">${h.ogImage ? `<meta property="og:image" content="${esc(h.ogImage)}"><meta name="twitter:card" content="summary_large_image">` : ''}`;
  const pixel = typeof page.pixel === 'string' && /^\d{8,20}$/.test(page.pixel) ? pixelCode(page.pixel) : '';
  return `<!doctype html><html lang="pt-BR"><head>${pixel}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${meta}<link rel="icon" href="/favicon.svg">${chrome}<style>body{margin:0}${String(page.css).replace(/<\/style/gi, '')}</style></head><body>${page.theme.showHeader ? header : ''}<main>${page.html}</main>${page.theme.showFooter ? footer : ''}${page.script}</body></html>`;
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'https://www.paibrunovieira.com.br');
  const slug = url.searchParams.get('slug') || ''; const token = url.searchParams.get('t');
  const reply = (status, html, cache) => { res.statusCode = status; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', cache); res.end(html); };
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return reply(404, notFound(), 'public, s-maxage=60');
  try {
    const response = await fetch(`${EVORAH_LANDINGS}/${slug}${token && /^[A-Za-z0-9_-]{24,64}$/.test(token) ? `?t=${token}` : ''}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (response.status === 404) return reply(404, notFound(), 'public, s-maxage=60');
    if (!response.ok) throw new Error(String(response.status));
    const page = await response.json();
    if (page.visibility !== 'public') res.setHeader('X-Robots-Tag', 'noindex');
    return reply(200, landingHtml(page), page.visibility === 'private' ? 'private, no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  } catch {
    return reply(503, notFound('Página indisponível no momento', 'Não foi possível carregar esta página agora. Tente de novo em instantes.'), 'no-store');
  }
}
