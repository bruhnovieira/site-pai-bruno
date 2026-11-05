/*
  Nova página de vendas — comportamento e mensuração.

  Mensuração (Meta Pixel 756056427466204):
    PageView          padrão, 1× por carregamento
    ViewContent       1× por carregamento (content_ids = produto Hotmart, value = preço exibido)
    OfferView         custom, 1× quando a seção de oferta aparece na tela
    CheckoutClick     custom, a cada clique num botão que leva ao checkout (position = hero/oferta/final/sticky)
    VSL_Play          custom, 1× quando o vídeo de vendas começa
    VSL_Progress      custom, 25/50/75/95% do vídeo (1× cada)
    Depoimento_Play   custom, ao abrir um depoimento
  Google (só se config.google tiver IDs reais): page_view, view_item, begin_checkout (clique para o checkout),
  video_start, video_progress. Com gtmId, os mesmos eventos vão para o dataLayer (padrão GA4 ecommerce).
  NÃO disparamos InitiateCheckout no clique: o checkout da Hotmart já envia InitiateCheckout para este
  mesmo pixel quando abre (navegador + servidor). Disparar no clique também duplicava a contagem.
  Purchase/purchase vem somente da Hotmart (pagamento confirmado) — esta página nunca envia compra.

  O pixel NÃO carrega em prévia (config.preview), fora do domínio de produção, nem com ?debug=1
  (nesse caso os eventos só aparecem no console).

  Consentimento (LGPD, versão de rastreamento 2026-11-04):
    - Google Consent Mode v2: tudo "denied" por padrão; vira "granted" só quando a pessoa aceita no aviso.
    - Meta Pixel: fbq('consent','revoke') até o aceite (nenhum evento sai antes).
    - Atribuição (EVORAH): só depois do aceite. Gera um código aleatório (ev…) guardado 90 dias neste
      navegador e passado ao checkout como xcod; a Hotmart devolve esse código no webhook da venda
      confirmada e a EVORAH liga a venda à visita (UTMs e, com aceite de anúncios, gclid/gbraid/wbraid).
      Nenhum nome, e-mail ou telefone é enviado.
    ?consent=1 mostra o aviso fora do domínio de produção (teste). A escolha fica em localStorage.
*/
(function () {
  'use strict';
  var C = window.ARCANO;
  if (!C) return;
  var qs = new URLSearchParams(location.search);
  var debug = qs.get('debug') === '1';
  var isProdHost = location.hostname === C.productionHost;
  // ?pixeltest=1 (só em prévia): executa o mesmo código do pixel contra um fbq falso que apenas registra
  // as chamadas em window.__fbqCalls — nada é enviado à Meta.
  var pixelTest = C.preview && qs.get('pixeltest') === '1';
  var pixelOn = (!C.preview && isProdHost && !debug) || pixelTest;

  /* ---------- Oferta exibida ---------- */
  var offer = C.offer, ver = offer.checkoutVerified;
  // Qualquer diferença entre o que a página mostra e o que o checkout cobra bloqueia a compra.
  var mismatch = offer.price !== ver.price || offer.installments !== ver.installments ||
    offer.installmentValue !== ver.installmentValue || !!offer.interestFree !== !!ver.interestFree ||
    C.checkoutUrl.indexOf('off=' + ver.offer) === -1 ||
    (C.altCheckoutUrl && (!C.altCheckoutVerified || C.altCheckoutUrl.indexOf('off=' + C.altCheckoutVerified.offer) === -1 || C.altCheckoutVerified.price !== offer.price));
  var brl = function (n) { return 'R$ ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var juros = offer.interestFree ? ' sem juros' : '';
  var installmentText = offer.installments + '× de R$ ' + offer.installmentValue + juros;
  // Com juros do comprador, mostra sempre o total parcelado (transparência; evita parecer "sem juros").
  var totalText = offer.interestFree ? '' : ' (total R$ ' + offer.installmentTotal + ')';

  document.querySelectorAll('[data-price-main]').forEach(function (el) {
    el.innerHTML = brl(offer.price) + '<small>à vista</small>';
  });
  document.querySelectorAll('[data-price-sub]').forEach(function (el) {
    el.textContent = 'ou em até ' + installmentText + ' no cartão' + totalText;
  });
  document.querySelectorAll('[data-price-line]').forEach(function (el) {
    el.textContent = brl(offer.price) + ' à vista ou em até ' + installmentText + ' no cartão';
  });
  document.querySelectorAll('[data-price-short]').forEach(function (el) {
    el.textContent = brl(offer.price) + ' à vista ou em até ' + installmentText + ' no cartão';
  });
  document.querySelectorAll('[data-sticky-price]').forEach(function (el) { el.textContent = brl(offer.price) + ' ou ' + offer.installments + '× R$ ' + offer.installmentValue; });
  document.querySelectorAll('[data-faq-installments]').forEach(function (el) {
    el.textContent = brl(offer.price) + ' à vista no Pix, no boleto, no PayPal ou no cartão. No cartão, também em até ' + installmentText + (offer.interestFree ? ' (total de ' + brl(offer.price) + ')' : totalText) + ', ou dividido em dois cartões. Se preferir não comprometer o limite do cartão, há o parcelamento alternativo da Hotmart (Pix Parcelado, Boleto Parcelado ou cobrança mensal no cartão), com as condições informadas no checkout.';
  });

  /* ---------- Prévia ---------- */
  if (C.preview) {
    var bar = document.getElementById('preview-bar') || document.body.insertAdjacentElement('afterbegin', Object.assign(document.createElement('div'), { id: 'preview-bar', className: 'preview-bar', innerHTML: '<p><b>PRÉVIA — não publicada.</b> <span id="preview-msg"></span></p>' }));
    var msg = document.getElementById('preview-msg');
    bar.hidden = false;
    msg.textContent = mismatch
      ? 'Os botões de compra estão bloqueados: o preço desta página não bate com o da oferta conferida na Hotmart.'
      : 'Preço conferido com a oferta ' + ver.offer + ' da Hotmart (' + brl(ver.price) + ' ou ' + ver.installments + '× R$ ' + ver.installmentValue + juros + '). Os botões levam ao checkout real; o pixel está desligado nesta prévia.';
  } else {
    document.querySelectorAll('.pending').forEach(function (el) { el.remove(); });
  }

  /* ---------- Consentimento ---------- */
  var TRACKING_VERSION = '2026-11-04';
  var CONSENT_KEY = 'arcano_consent_v1';
  var consentRequired = C.consentRequired !== false;
  var consent = null;
  try { consent = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch (e) { consent = null; }
  var granted = function (kind) { return !consentRequired || !!(consent && consent[kind]); };
  window.dataLayer = window.dataLayer || [];
  function gtagC() { window.dataLayer.push(arguments); }
  var consentState = function () { var ads = granted('ads') ? 'granted' : 'denied'; return { ad_storage: ads, ad_user_data: ads, ad_personalization: ads, analytics_storage: granted('analytics') ? 'granted' : 'denied' }; };
  // Precisa vir ANTES do GTM: as tags do Google leem o estado padrão na inicialização.
  var cDefault = consentState(); cDefault.functionality_storage = 'granted'; cDefault.security_storage = 'granted'; cDefault.wait_for_update = 500;
  gtagC('consent', 'default', cDefault);
  gtagC('set', 'ads_data_redaction', true);
  gtagC('set', 'url_passthrough', true);

  /* ---------- Pixel ---------- */
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  function track(name, params, custom) {
    params = params || {};
    var opts = { eventID: name + '.' + uid() };
    if (debug || C.preview) console.info('[pixel' + (pixelOn ? '' : ' desligado') + ']', name, params, opts);
    if (!pixelOn || typeof window.fbq !== 'function') return;
    window.fbq(custom ? 'trackCustom' : 'track', name, params, opts);
    // Sem consentimento o pixel não envia. Guardamos o evento para reenviar no aceite com o MESMO eventID
    // (se a Meta já o tiver enfileirado, ela deduplica pelo eventID).
    if (consentRequired && !granted('ads')) held.push([custom ? 'trackCustom' : 'track', name, params, opts]);
  }
  var held = [];
  if (pixelTest) {
    window.__fbqCalls = [];
    window.fbq = function () { window.__fbqCalls.push(Array.prototype.slice.call(arguments)); };
    window.fbq('init', C.pixelId);
  } else if (pixelOn) {
    /* Código base do Meta Pixel (mesmo ID da página atual) */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    if (consentRequired && !granted('ads')) window.fbq('consent', 'revoke');
    window.fbq('init', C.pixelId);
  }
  var contentParams = { content_name: C.productName, content_ids: [C.productId], content_type: 'product', value: offer.price, currency: 'BRL' };
  track('PageView');
  track('ViewContent', contentParams);

  /* ---------- Google (GA4 / Ads / GTM) — carrega somente com IDs configurados ---------- */
  var G = C.google || {};
  var googleOn = pixelOn && !pixelTest && !!(G.gtmId || G.ga4Id || G.adsId);
  var gItem = { item_id: C.productId, item_name: C.productName, item_brand: 'Pai Bruno Vieira', item_category: 'Curso online', price: offer.price, quantity: 1 };
  // Modo básico (padrão): nada do Google carrega antes do aceite. Modo avançado (consentMode: 'advanced'):
  // carrega já com tudo "denied" e o Google recebe só sinais sem cookies até o aceite.
  var googleLoaded = false;
  function loadGoogle() {
    if (!googleOn || googleLoaded) return;
    if (consentRequired && C.consentMode !== 'advanced' && !granted('analytics') && !granted('ads')) return;
    googleLoaded = true;
    if (G.gtmId) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var gs = document.createElement('script'); gs.async = true; gs.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(G.gtmId); document.head.appendChild(gs);
    } else {
      window.gtag = gtagC;
      var gt = document.createElement('script'); gt.async = true; gt.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(G.ga4Id || G.adsId); document.head.appendChild(gt);
      window.gtag('js', new Date());
      if (G.ga4Id) window.gtag('config', G.ga4Id);
      if (G.adsId) window.gtag('config', G.adsId);
    }
  }
  loadGoogle();
  function gEvent(name, params, isEcommerce) {
    if (debug || C.preview) console.info('[google' + (googleOn ? '' : ' desligado') + ']', name, params);
    if (!googleOn) return;
    if (G.gtmId) {
      if (isEcommerce) window.dataLayer.push({ ecommerce: null });
      var payload = { event: name, tracking_version: TRACKING_VERSION };
      if (isEcommerce) payload.ecommerce = params; else for (var k in params) payload[k] = params[k];
      window.dataLayer.push(payload);
    } else {
      window.gtag('event', name, params);
    }
  }
  gEvent('view_item', { currency: 'BRL', value: offer.price, items: [gItem] }, true);

  /* ---------- Checkout com rastreamento preservado ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'src', 'sck', 'xcod', 'fbclid', 'gclid', 'gbraid', 'wbraid'];
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('arcano_utm') || '{}'); } catch (e) { stored = {}; }
  KEYS.forEach(function (k) { if (qs.get(k)) stored[k] = qs.get(k); });
  try { sessionStorage.setItem('arcano_utm', JSON.stringify(stored)); } catch (e) { /* sem storage: segue só com a URL atual */ }

  function checkoutHref(position, base) {
    var url = new URL(base || C.checkoutUrl);
    KEYS.forEach(function (k) { if (stored[k]) url.searchParams.set(k, stored[k]); });
    // Hotmart: "src" = origem e "sck" = código de rastreamento, ambos aparecem no relatório de vendas.
    if (!stored.src && stored.utm_source) url.searchParams.set('src', stored.utm_source);
    if (!stored.sck) url.searchParams.set('sck', C.sck + '_' + position);
    // Código de atribuição da EVORAH (só com consentimento e se o visitante não trouxe um xcod próprio).
    var aid = (granted('ads') || granted('analytics')) ? attributionId(true) : null;
    if (aid && !stored.xcod) url.searchParams.set('xcod', aid);
    return url.toString();
  }

  /* ---------- Atribuição na EVORAH ---------- */
  var EV = C.evorah || {};
  var AID_KEY = 'arcano_aid_v1';
  function attributionId(create) {
    var id = null;
    try { var rec = JSON.parse(localStorage.getItem(AID_KEY) || 'null'); if (rec && rec.exp > Date.now() && /^ev[a-z0-9]{10,30}$/.test(rec.id)) id = rec.id; } catch (e) { id = null; }
    if (!id && create) {
      var bytes = new Uint8Array(12); (window.crypto || window.msCrypto).getRandomValues(bytes);
      id = 'ev' + Array.prototype.map.call(bytes, function (b) { return (b % 36).toString(36); }).join('');
      try { localStorage.setItem(AID_KEY, JSON.stringify({ id: id, exp: Date.now() + 90 * 864e5 })); } catch (e) { /* sem storage: código vale só nesta página */ }
    }
    return id;
  }
  function gaIds() {
    var ck = document.cookie || ''; var m = ck.match(/(?:^|; )_ga=GA\d\.\d\.(\d+\.\d+)/); var out = {};
    if (m) out.clientId = m[1];
    var sm = ck.match(/(?:^|; )_ga_[A-Z0-9]+=GS\d\.\d\.(?:s)?(\d+)/); if (sm) out.sessionId = sm[1];
    return out;
  }
  var lastTouch = 0;
  function sendTouch() {
    if (!EV.siteId || !EV.touchUrl || !(granted('ads') || granted('analytics'))) return;
    if (!(isProdHost && !C.preview) && !debug) return;
    if (Date.now() - lastTouch < 3000) return; lastTouch = Date.now();
    var params = {}; KEYS.forEach(function (k) { if (stored[k] && k !== 'src' && k !== 'sck' && k !== 'xcod') params[k] = stored[k]; });
    var body = JSON.stringify({ site: EV.siteId, aid: attributionId(true), consent: { ads: granted('ads'), analytics: granted('analytics') }, params: params, path: location.pathname, referrer: document.referrer || '', ga: granted('analytics') ? gaIds() : undefined });
    if (debug) console.info('[evorah] toque', body);
    // text/plain = requisição simples (sem preflight); keepalive garante o envio mesmo indo para o checkout.
    try { fetch(EV.touchUrl, { method: 'POST', body: body, keepalive: true, mode: 'cors', credentials: 'omit', headers: { 'content-type': 'text/plain' } }).catch(function () {}); } catch (e) { /* rede indisponível */ }
  }

  var toast;
  function blockedNotice(btn) {
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:40;max-width:min(92vw,520px);background:#2b2203;color:#fff;padding:.9rem 1.1rem;font:500 .85rem/1.4 DM Sans,sans-serif;box-shadow:0 12px 30px -10px rgba(0,0,0,.5)';
      document.body.appendChild(toast);
    }
    toast.textContent = 'Prévia: este botão levaria ao checkout da Hotmart, que hoje cobra ' + brl(offer.checkoutVerified.price) + '. Ele fica bloqueado até o preço da Hotmart e o da página serem iguais.';
    toast.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { toast.hidden = true; }, 6000);
  }

  var begun = {};
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    var position = a.getAttribute('data-cta');
    if (mismatch) {
      a.setAttribute('href', '#oferta');
      a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', function (e) { e.preventDefault(); blockedNotice(a); });
      return;
    }
    var alt = a.hasAttribute('data-cta-alt') && C.altCheckoutUrl;
    a.setAttribute('href', checkoutHref(position, alt ? C.altCheckoutUrl : C.checkoutUrl));
    a.addEventListener('click', function () {
      // Recalcula o link (o consentimento pode ter mudado) e atualiza o toque com o client_id do GA4.
      a.setAttribute('href', checkoutHref(position, alt ? C.altCheckoutUrl : C.checkoutUrl));
      lastTouch = 0; sendTouch();
      track('CheckoutClick', { position: position, checkout: alt ? 'alternativo' : 'principal', content_ids: [C.productId], value: offer.price, currency: 'BRL' }, true);
      // GA4: begin_checkout = intenção (clique que leva ao checkout externo). Não é compra e não deve ser a conversão principal do Ads.
      // Dedupe: um begin_checkout por tipo de checkout por visualização da página (cliques repetidos não inflam o funil).
      var kind = alt ? 'alt' : 'std';
      if (!begun[kind]) { begun[kind] = true; gEvent('begin_checkout', { currency: 'BRL', value: offer.price, cta_position: position, payment_type: alt ? 'parcelamento_hotmart' : 'padrao', items: [gItem] }, true); }
    });
  });
  addEventListener('pageshow', function (e) { if (e.persisted) begun = {}; });

  /* ---------- Aviso de cookies ---------- */
  var showBanner = consentRequired && ((isProdHost && !C.preview) || qs.get('consent') === '1');
  function applyConsent(choice) {
    consent = { ads: !!choice, analytics: !!choice, at: new Date().toISOString(), v: TRACKING_VERSION };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch (e) { /* escolha vale só nesta visita */ }
    gtagC('consent', 'update', consentState());
    loadGoogle(); // no modo básico, o GTM entra agora (os eventos já enfileirados no dataLayer, como view_item, são lidos por ele)
    window.dataLayer.push({ event: 'consent_update', consent_ads: granted('ads'), consent_analytics: granted('analytics'), tracking_version: TRACKING_VERSION });
    if (typeof window.fbq === 'function' && (pixelOn || pixelTest)) {
      window.fbq('consent', granted('ads') ? 'grant' : 'revoke');
      if (granted('ads')) { held.forEach(function (ev) { window.fbq(ev[0], ev[1], ev[2], ev[3]); }); held = []; }
    }
    if (!granted('ads') && !granted('analytics')) { try { localStorage.removeItem(AID_KEY); } catch (e) { /* nada a apagar */ } }
    document.querySelectorAll('[data-cta]').forEach(function (a) { if (a.getAttribute('aria-disabled') !== 'true') a.setAttribute('href', checkoutHref(a.getAttribute('data-cta'), a.hasAttribute('data-cta-alt') && C.altCheckoutUrl ? C.altCheckoutUrl : C.checkoutUrl)); });
    sendTouch();
  }
  function openBanner() {
    var box = document.getElementById('consent-box');
    if (!box) {
      box = document.createElement('div'); box.id = 'consent-box'; box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Preferências de cookies');
      box.innerHTML = '<p>Usamos cookies para medir as visitas e os anúncios (Google e Meta) e saber o que funciona nesta página. Você escolhe. <a href="/politica#cookies">Política de Privacidade</a></p><div><button type="button" data-consent="0">Recusar</button><button type="button" data-consent="1">Aceitar</button></div>';
      box.addEventListener('click', function (e) { var b = e.target.closest('[data-consent]'); if (!b) return; applyConsent(b.getAttribute('data-consent') === '1'); box.hidden = true; });
      document.body.appendChild(box);
    }
    box.hidden = false;
  }
  if (showBanner && !consent) openBanner();
  if (consentRequired) {
    var foot = document.querySelector('.foot p:last-child');
    if (foot) { var pref = document.createElement('a'); pref.href = '#cookies'; pref.textContent = 'Preferências de cookies'; pref.addEventListener('click', function (e) { e.preventDefault(); openBanner(); }); foot.appendChild(document.createTextNode(' · ')); foot.appendChild(pref); }
  }
  sendTouch();

  /* ---------- VSL com progresso ---------- */
  var V = C.vsl;
  var vslBox = document.querySelector('.video[data-video="vsl"]');
  var thumb = document.querySelector('[data-vsl-thumb]');
  // A miniatura já vem no HTML (carrega cedo, sem JS); só troca se o vídeo configurado for outro.
  if (thumb && thumb.src.indexOf('/vi/' + V.id + '/') === -1) thumb.src = 'https://i.ytimg.com/vi/' + V.id + '/maxresdefault.jpg';
  document.querySelectorAll('[data-vsl-note]').forEach(function (el) { el.textContent = V.note || ''; el.hidden = !V.note; });
  var player = null, ytReady = null, sent = {};
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(function (resolve) {
      if (window.YT && window.YT.Player) return resolve();
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); resolve(); };
      var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true; document.head.appendChild(s);
    });
    return ytReady;
  }
  function startVsl(at) {
    if (player && player.seekTo) { player.seekTo(at || 0, true); player.playVideo(); return; }
    if (vslBox.dataset.started) return;
    vslBox.dataset.started = '1';
    var holder = document.createElement('div'); holder.id = 'vsl-player';
    vslBox.innerHTML = ''; vslBox.appendChild(holder);
    track('VSL_Play', { video: V.id, start: at || 0 }, true);
    gEvent('video_start', { video_provider: 'youtube', video_title: V.title, video_url: 'https://youtu.be/' + V.id });
    loadYT().then(function () {
      player = new window.YT.Player('vsl-player', {
        host: 'https://www.youtube-nocookie.com', videoId: V.id,
        // autoplay só depois do clique do visitante (gesto do usuário); nunca ao carregar a página.
        playerVars: { autoplay: 1, start: at || 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: function (e) { e.target.getIframe().title = V.title || 'Vídeo de apresentação do Curso Completo de Tarot e Magia'; },
          onStateChange: function (e) { if (e.data === 1) watchProgress(); }
        }
      });
    });
  }
  // Percentual = tempo REALMENTE assistido / duração (pular trechos não conta como assistido).
  var progressTimer, watched = 0, lastT = null;
  function watchProgress() {
    clearInterval(progressTimer);
    lastT = null;
    progressTimer = setInterval(function () {
      if (!player || !player.getDuration) return;
      var d = player.getDuration(), t = player.getCurrentTime();
      if (!d) return;
      if (lastT !== null && t > lastT && t - lastT < 2.5) watched += t - lastT;
      lastT = t;
      [25, 50, 75, 95].forEach(function (p) {
        if (!sent[p] && watched / d * 100 >= p) {
          sent[p] = true;
          track('VSL_Progress', { video: V.id, percent: p }, true);
          gEvent('video_progress', { video_provider: 'youtube', video_title: V.title, video_percent: p });
        }
      });
      if (player.getPlayerState && player.getPlayerState() !== 1) clearInterval(progressTimer);
    }, 1000);
  }
  if (vslBox) vslBox.querySelector('.play').addEventListener('click', function () { startVsl(0); });
  // Miniatura em alta resolução indisponível → usa a padrão
  document.querySelectorAll('.video img').forEach(function (img) {
    img.addEventListener('error', function () { if (!/hqdefault/.test(img.src)) img.src = img.src.replace(/maxresdefault|sddefault|hq720/, 'hqdefault'); });
  });

  /* ---------- Depoimentos (só com autorização confirmada: config.testimonialsEnabled) ---------- */
  var grid = document.getElementById('test-grid');
  if (C.testimonialsEnabled) {
    document.getElementById('depoimentos').hidden = false;
    document.querySelectorAll('[data-testimonials-link]').forEach(function (a) { a.hidden = false; });
  }
  // Posiciona a miniatura para que a área útil (crop) cubra uma moldura de proporção `ratio` (w/h), centralizada.
  function cropStyle(p, ratio) {
    var c = p.crop, R = p.w / p.h, w, h, l, t;
    if ((c.w * R) / c.h > ratio) { h = 100 / c.h; w = 100 * R / (c.h * ratio); l = 50 - (c.x + c.w / 2) * w; t = -c.y * h; }
    else { w = 100 / c.w; h = 100 * ratio / (c.w * R); l = -c.x * w; t = 50 - (c.y + c.h / 2) * h; }
    return 'width:' + w.toFixed(2) + '%;height:' + h.toFixed(2) + '%;left:' + l.toFixed(2) + '%;top:' + t.toFixed(2) + '%';
  }
  var modal, modalFrame, modalName, lastTrigger;
  function openTestimonial(t, trigger) {
    track('Depoimento_Play', { name: t.name }, true);
    var src = 'https://www.youtube-nocookie.com/embed/' + t.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    if (!window.HTMLDialogElement) { window.open('https://www.youtube.com/watch?v=' + t.id, '_blank', 'noopener'); return; }
    if (!modal) {
      modal = document.createElement('dialog');
      modal.className = 'test-modal';
      modal.setAttribute('aria-label', 'Depoimento');
      modal.innerHTML = '<div class="test-modal-box"><button type="button" class="test-modal-close">Fechar <span aria-hidden="true">✕</span></button><div class="test-modal-frame"></div><p class="test-modal-name"></p></div>';
      document.body.appendChild(modal);
      modalFrame = modal.querySelector('.test-modal-frame');
      modalName = modal.querySelector('.test-modal-name');
      modal.querySelector('.test-modal-close').addEventListener('click', function () { modal.close(); });
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
      modal.addEventListener('close', function () { modalFrame.innerHTML = ''; if (lastTrigger) lastTrigger.focus(); });
    }
    lastTrigger = trigger;
    modal.style.setProperty('--ar', t.video);
    modal.setAttribute('aria-label', 'Depoimento de ' + t.name);
    modal.dataset.format = t.video < 1 ? 'vertical' : 'horizontal';
    modalName.textContent = t.name + ' · ' + (t.format === 'audio' ? 'depoimento em áudio' : 'depoimento em vídeo');
    modalFrame.innerHTML = '<iframe src="' + src + '" title="Depoimento de ' + t.name + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    modal.showModal();
    modal.querySelector('.test-modal-close').focus();
  }
  (C.testimonialsEnabled ? C.testimonials : []).forEach(function (t) {
    var card = document.createElement('article');
    card.className = 'test-card' + (t.format === 'audio' ? ' is-audio' : '');
    var img = '<img src="https://i.ytimg.com/vi/' + t.id + '/' + t.poster.src + '.jpg" alt="" loading="lazy" decoding="async" style="' + cropStyle(t.poster, t.format === 'audio' ? 1 : 9 / 16) + '">';
    var media = t.format === 'audio'
      ? '<span class="test-audio"><span class="test-avatar">' + img + '</span><span class="test-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></span>'
      : '<span class="test-poster">' + img + '</span>';
    var kind = t.format === 'audio' ? 'Depoimento em áudio' : 'Depoimento em vídeo';
    card.innerHTML = '<button type="button" class="test-media">' + media + '<span class="play-badge"><b aria-hidden="true">▶</b> ' + (t.format === 'audio' ? 'Ouvir' : 'Assistir') + ' · ' + t.duration + '<span class="sr-only"> — ' + kind.toLowerCase() + ' de ' + t.name + '</span></span></button><h3>' + t.name + '</h3><p>' + kind + ' · ' + t.duration + '</p>';
    var btn = card.querySelector('.test-media');
    btn.addEventListener('click', function () { openTestimonial(t, btn); });
    grid.appendChild(card);
  });

  /* ---------- Abas da demonstração (teclado incluído) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role=tab]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  /* ---------- Sticky mobile + OfferView ---------- */
  var sticky = document.querySelector('.sticky');
  var hero = document.querySelector('.hero-wrap');
  var offerSec = document.getElementById('oferta');
  var finalSec = document.querySelector('.final');
  var state = { heroVisible: true, offerVisible: false, finalVisible: false };
  function syncSticky() { sticky.classList.toggle('show', !state.heroVisible && !state.offerVisible && !state.finalVisible); }
  if ('IntersectionObserver' in window) {
    var offerSeen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.target === hero) state.heroVisible = en.isIntersecting;
        else if (en.target === finalSec) state.finalVisible = en.isIntersecting;
        else {
          state.offerVisible = en.isIntersecting;
          if (en.isIntersecting && !offerSeen) { offerSeen = true; track('OfferView', { value: offer.price, currency: 'BRL' }, true); }
        }
      });
      syncSticky();
    }, { threshold: 0.15 });
    [hero, offerSec, finalSec].forEach(function (el) { io.observe(el); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
