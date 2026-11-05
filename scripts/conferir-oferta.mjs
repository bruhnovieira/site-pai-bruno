#!/usr/bin/env node
/*
  Conferência antes de publicar a página do Método Arcano.
  Uso:  node scripts/conferir-oferta.mjs            (confere a configuração atual)
        node scripts/conferir-oferta.mjs --nova     (confere também se a VSL nova já pode entrar)

  O que faz (só leitura, por HTTP, sem navegador: NÃO dispara pixel, NÃO gera InitiateCheckout):
  1. Lê o payload público do checkout da Hotmart (config.checkoutUrl) e compara preço à vista,
     parcela máxima, valor da parcela, juros, garantia e código da oferta com config.offer.
  2. Confere se o vídeo configurado (e, com --nova, o vslNova) está público para incorporação e já processado.
  3. Confere se o HTML (links estáticos, preço de fallback, JSON-LD, miniatura) bate com a configuração.
  Sai com código 1 se algo divergir.
*/
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../dist/', import.meta.url);
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL('curso-tarot-e-magia/config.js', root), 'utf8'), sandbox);
const C = sandbox.window.ARCANO;
const html = readFileSync(new URL('index.html', root), 'utf8');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
let fail = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fail++; console.log('  ERRO ' + m); };
const fmt = (n) => n.toFixed(2).replace('.', ',');

async function load(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR' } });
  if (!res.ok) { bad('checkout respondeu HTTP ' + res.status); return null; }
  const page = await res.text();
  const m = page.match(/id="__NUXT_DATA__">([\s\S]*?)<\/script>/);
  if (!m) { bad('não encontrei os dados do checkout (a Hotmart mudou o formato?)'); return null; }
  const arr = JSON.parse(m[1]);
  const R = (i, d = 0) => {
    const v = arr[i];
    if (d > 16) return null;
    if (Array.isArray(v)) {
      if (['ShallowReactive', 'Reactive', 'Ref', 'ShallowRef'].includes(v[0])) return R(v[1], d + 1);
      return v.map((x) => (typeof x === 'number' ? R(x, d + 1) : x));
    }
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'number' ? R(x, d + 1) : x]));
    return v;
  };
  const idx = arr.findIndex((v) => v && typeof v === 'object' && !Array.isArray(v) && 'warrantyDays' in v && 'offer' in v);
  return idx < 0 ? null : R(idx);
}

let mainProductId = null;
async function altCheckout() {
  if (!C.altCheckoutUrl) return;
  console.log('\nCheckout alternativo: ' + C.altCheckoutUrl);
  const prod = await load(C.altCheckoutUrl);
  if (!prod) return bad('produto não encontrado no checkout alternativo');
  const off = prod.offer, want = C.altCheckoutVerified || {};
  const types = off.paymentMethods.map((p) => p.type);
  console.log(`  produto "${prod.name}" (id ${prod.id}) · oferta ${off.key} · formas: ${types.join(', ')}`);
  prod.id === mainProductId ? ok('mesmo produto do checkout principal') : bad(`produto ${prod.id} ≠ principal ${mainProductId}`);
  off.key === want.offer ? ok('código da oferta alternativa') : bad(`oferta ${off.key} ≠ ${want.offer}`);
  JSON.stringify(types) === JSON.stringify(want.methods) ? ok('formas de pagamento = ' + types.join(', ')) : bad(`formas ${types} ≠ ${want.methods}`);
  const hi = off.paymentMethods.find((p) => p.type === 'HOTMART_INSTALLMENTS');
  if (hi) {
    const subs = hi.additionalData.methods.map((m) => m.type);
    console.log('  Parcelamento Hotmart via: ' + subs.join(', ') + ` · juros ${(hi.interestRate * 100).toFixed(2)}% a.m.`);
    hi.additionalData.methods.forEach((m) => {
      const last = m.installments[m.installments.length - 1];
      console.log(`    ${m.type}: à vista R$ ${fmt(m.amount.value)} · até ${last.number}× R$ ${fmt(last.amount.value)} (total R$ ${fmt(last.fullAmount.value)})`);
      m.amount.value === C.offer.price ? null : bad(`${m.type} à vista R$ ${m.amount.value} ≠ R$ ${C.offer.price}`);
    });
    ['PIX', 'BILLET', 'CREDIT_CARD'].every((t) => subs.includes(t)) ? ok('Pix Parcelado, Boleto Parcelado e cartão recorrente disponíveis (texto da página)') : bad('a página anuncia Pix/Boleto/cartão no parcelamento alternativo, mas o checkout não tem todos');
  }
  prod.warrantyDays === C.guaranteeDays ? ok('garantia') : bad(`garantia ${prod.warrantyDays} ≠ ${C.guaranteeDays}`);
}

async function checkout() {
  console.log('\nCheckout: ' + C.checkoutUrl);
  const res = await fetch(C.checkoutUrl, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR' } });
  if (!res.ok) return bad('checkout respondeu HTTP ' + res.status);
  const page = await res.text();
  const m = page.match(/id="__NUXT_DATA__">([\s\S]*?)<\/script>/);
  if (!m) return bad('não encontrei os dados do checkout (a Hotmart mudou o formato?)');
  const arr = JSON.parse(m[1]);
  const R = (i, d = 0) => {
    const v = arr[i];
    if (d > 14) return null;
    if (Array.isArray(v)) {
      if (['ShallowReactive', 'Reactive', 'Ref', 'ShallowRef'].includes(v[0])) return R(v[1], d + 1);
      return v.map((x) => (typeof x === 'number' ? R(x, d + 1) : x));
    }
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'number' ? R(x, d + 1) : x]));
    return v;
  };
  const idx = arr.findIndex((v) => v && typeof v === 'object' && !Array.isArray(v) && 'warrantyDays' in v && 'offer' in v);
  if (idx < 0) return bad('produto não encontrado no payload');
  const prod = R(idx);
  mainProductId = prod.id;
  const off = prod.offer;
  const card = off.paymentMethods.find((p) => p.type === 'CREDIT_CARD');
  const max = card.installments[card.installments.length - 1];
  const want = C.offer.checkoutVerified;
  console.log(`  produto "${prod.name}" · oferta ${off.key} ("${off.description}") · garantia ${prod.warrantyDays} dias`);
  console.log(`  à vista R$ ${fmt(card.amount.value)} · ${max.number}× de R$ ${fmt(max.amount.value)} (total R$ ${fmt(max.fullAmount.value)})`);
  console.log('  formas: ' + off.paymentMethods.map((p) => p.type + (p.offer && p.offer !== off.key ? ` (oferta ${p.offer})` : '')).join(', '));
  off.key === want.offer ? ok('código da oferta') : bad(`oferta ${off.key} ≠ ${want.offer}`);
  card.amount.value === C.offer.price ? ok('preço à vista') : bad(`preço R$ ${card.amount.value} ≠ página R$ ${C.offer.price}`);
  max.number === C.offer.installments ? ok('número de parcelas') : bad(`${max.number}× ≠ ${C.offer.installments}×`);
  fmt(max.amount.value) === C.offer.installmentValue ? ok('valor da parcela') : bad(`parcela ${fmt(max.amount.value)} ≠ ${C.offer.installmentValue}`);
  const interestFree = Math.abs(max.fullAmount.value - card.amount.value) < 0.01;
  if (!interestFree) fmt(max.fullAmount.value) === C.offer.installmentTotal ? ok('total parcelado R$ ' + C.offer.installmentTotal) : bad(`total ${fmt(max.fullAmount.value)} ≠ ${C.offer.installmentTotal}`);
  interestFree === !!C.offer.interestFree ? ok('sem juros: ' + interestFree) : bad(`sem juros no checkout = ${interestFree}, na página = ${!!C.offer.interestFree}`);
  prod.warrantyDays === C.guaranteeDays ? ok('garantia') : bad(`garantia ${prod.warrantyDays} ≠ ${C.guaranteeDays}`);
  JSON.stringify(C.offer.checkoutVerified) === JSON.stringify({ offer: C.offer.checkoutVerified.offer, price: C.offer.price, installments: C.offer.installments, installmentValue: C.offer.installmentValue, interestFree: C.offer.interestFree })
    ? ok('offer = checkoutVerified (botões liberados)') : bad('offer ≠ checkoutVerified: a página vai bloquear os botões');
}

async function video(v, label) {
  console.log(`\nVídeo ${label}: https://youtu.be/${v.id}`);
  const o = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`);
  o.ok ? ok('incorporação permitida (oEmbed 200)') : bad('oEmbed HTTP ' + o.status + ' (vídeo privado, removido ou incorporação bloqueada)');
  const w = await (await fetch(`https://www.youtube.com/watch?v=${v.id}`, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR' } })).text();
  const st = (w.match(/"playabilityStatus":\{"status":"([A-Z_]+)"(?:,"reason":"([^"]*)")?/) || [])[1] || '?';
  const reason = (w.match(/"playabilityStatus":\{"status":"[A-Z_]+","reason":"([^"]*)"/) || [])[1] || '';
  const secs = Number((w.match(/"lengthSeconds":"(\d+)"/) || [])[1] || 0);
  st === 'OK' ? ok('reproduzível') : bad(`status ${st}${reason ? ' — ' + reason : ''}`);
  secs > 0 ? ok(`duração ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`) : bad('duração ainda indisponível (processamento)');
  const t = await fetch(`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`);
  t.ok ? ok('miniatura disponível') : bad('miniatura ainda não gerada');
}

function htmlChecks() {
  console.log('\nHTML (dist/index.html)');
  const hrefs = [...html.matchAll(/data-cta="[^"]+" href="([^"]+)"/g)].map((m) => m[1]);
  hrefs.length && hrefs.every((h) => h === C.checkoutUrl) ? ok(`${hrefs.length} botões principais → checkout principal`) : bad('links estáticos dos botões principais ≠ checkoutUrl');
  const alts = [...html.matchAll(/data-cta-alt href="([^"]+)"/g)].map((m) => m[1]);
  alts.length === 1 && alts[0] === C.altCheckoutUrl ? ok('1 botão secundário → checkout alternativo') : bad(`botões alternativos: ${alts.join(', ') || 'nenhum'}`);
  const ld = html.match(/"price":"([\d.]+)"/);
  ld && Number(ld[1]) === C.offer.price ? ok('JSON-LD com o preço da configuração') : bad(`JSON-LD price ${ld && ld[1]} ≠ ${C.offer.price}`);
  html.includes(`/vi/${C.vsl.id}/`) ? ok('miniatura estática = VSL configurada') : bad('miniatura estática no HTML é de outro vídeo');
  const prices = [...html.matchAll(/R\$\s?([\d.]+(?:,\d{2})?)/g)].map((m) => m[1]);
  const allowed = new Set([String(C.offer.price), C.offer.installmentValue, C.offer.installmentTotal].filter(Boolean));
  const odd = prices.filter((p) => !allowed.has(p));
  odd.length ? bad('valores em R$ no HTML fora da configuração: ' + odd.join(', ')) : ok('nenhum preço antigo ou divergente no HTML');
  html.includes('noindex') ? bad('HTML contém noindex') : ok('indexável');
}

await checkout();
await altCheckout();
await video(C.vsl, 'configurado');
if (process.argv.includes('--nova') && C.vslNova) await video(C.vslNova, 'nova (vslNova)');
htmlChecks();
console.log(fail ? `\n${fail} problema(s). NÃO publique.` : '\nTudo confere.');
process.exit(fail ? 1 : 0);
