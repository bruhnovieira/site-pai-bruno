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
  NÃO disparamos InitiateCheckout no clique: o checkout da Hotmart já envia InitiateCheckout para este
  mesmo pixel quando abre (navegador + servidor). Disparar no clique também duplicava a contagem.
  Purchase vem somente da Hotmart (pagamento confirmado) — esta página nunca envia Purchase.

  O pixel NÃO carrega em prévia (config.preview), fora do domínio de produção, nem com ?debug=1
  (nesse caso os eventos só aparecem no console).
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
    C.checkoutUrl.indexOf('off=' + ver.offer) === -1;
  var brl = function (n) { return 'R$ ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var juros = offer.interestFree ? ' sem juros' : '';
  var installmentText = offer.installments + '× de R$ ' + offer.installmentValue + juros;

  document.querySelectorAll('[data-price-main]').forEach(function (el) {
    el.innerHTML = brl(offer.price) + '<small>à vista</small>';
  });
  document.querySelectorAll('[data-price-sub]').forEach(function (el) {
    el.textContent = 'ou ' + installmentText + ' no cartão' + (offer.interestFree ? '' : ' (o parcelamento tem acréscimo)');
  });
  document.querySelectorAll('[data-price-line]').forEach(function (el) {
    el.textContent = brl(offer.price) + ' à vista ou ' + installmentText + ' · garantia de ' + C.guaranteeDays + ' dias';
  });
  document.querySelectorAll('[data-price-short]').forEach(function (el) {
    el.textContent = brl(offer.price) + ' à vista ou ' + installmentText;
  });
  document.querySelectorAll('[data-sticky-price]').forEach(function (el) { el.textContent = brl(offer.price) + ' ou ' + offer.installments + '× ' + offer.installmentValue; });
  document.querySelectorAll('[data-faq-installments]').forEach(function (el) {
    el.textContent = 'Sim. No cartão de crédito em até ' + installmentText + ' (total de ' + brl(offer.price) + '), ou à vista no Pix ou no boleto. Também é possível dividir o pagamento em dois cartões; nesse caso, as condições aparecem no checkout.';
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

  /* ---------- Pixel ---------- */
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  function track(name, params, custom) {
    params = params || {};
    var opts = { eventID: name + '.' + uid() };
    if (debug || C.preview) console.info('[pixel' + (pixelOn ? '' : ' desligado') + ']', name, params, opts);
    if (!pixelOn || typeof window.fbq !== 'function') return;
    window.fbq(custom ? 'trackCustom' : 'track', name, params, opts);
  }
  if (pixelTest) {
    window.__fbqCalls = [];
    window.fbq = function () { window.__fbqCalls.push(Array.prototype.slice.call(arguments)); };
    window.fbq('init', C.pixelId);
  } else if (pixelOn) {
    /* Código base do Meta Pixel (mesmo ID da página atual) */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.pixelId);
  }
  var contentParams = { content_name: C.productName, content_ids: [C.productId], content_type: 'product', value: offer.price, currency: 'BRL' };
  track('PageView');
  track('ViewContent', contentParams);

  /* ---------- Checkout com rastreamento preservado ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'src', 'sck', 'xcod', 'fbclid', 'gclid'];
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('arcano_utm') || '{}'); } catch (e) { stored = {}; }
  KEYS.forEach(function (k) { if (qs.get(k)) stored[k] = qs.get(k); });
  try { sessionStorage.setItem('arcano_utm', JSON.stringify(stored)); } catch (e) { /* sem storage: segue só com a URL atual */ }

  function checkoutHref(position) {
    var url = new URL(C.checkoutUrl);
    KEYS.forEach(function (k) { if (stored[k]) url.searchParams.set(k, stored[k]); });
    // Hotmart: "src" = origem e "sck" = código de rastreamento, ambos aparecem no relatório de vendas.
    if (!stored.src && stored.utm_source) url.searchParams.set('src', stored.utm_source);
    if (!stored.sck) url.searchParams.set('sck', C.sck + '_' + position);
    return url.toString();
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

  document.querySelectorAll('[data-cta]').forEach(function (a) {
    var position = a.getAttribute('data-cta');
    if (mismatch) {
      a.setAttribute('href', '#oferta');
      a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', function (e) { e.preventDefault(); blockedNotice(a); });
      return;
    }
    a.setAttribute('href', checkoutHref(position));
    a.addEventListener('click', function () {
      track('CheckoutClick', { position: position, content_ids: [C.productId], value: offer.price, currency: 'BRL' }, true);
    });
  });

  /* ---------- VSL com progresso ---------- */
  var V = C.vsl;
  var vslBox = document.querySelector('.video[data-video="vsl"]');
  var thumb = document.querySelector('[data-vsl-thumb]');
  if (thumb) thumb.src = 'https://i.ytimg.com/vi/' + V.id + '/maxresdefault.jpg';
  document.querySelectorAll('[data-vsl-duration]').forEach(function (el) { el.textContent = V.duration ? ' · ' + V.duration : ''; });
  document.querySelectorAll('[data-vsl-note]').forEach(function (el) { el.textContent = V.note || ''; el.hidden = !V.note; });
  var chapList = document.getElementById('vsl-chapters');
  if (chapList) {
    chapList.hidden = !V.chapters.length;
    V.chapters.forEach(function (c) {
      var li = document.createElement('li');
      var mm = Math.floor(c.t / 60) + ':' + ('0' + (c.t % 60)).slice(-2);
      li.innerHTML = '<button type="button" data-seek="' + c.t + '"><time>' + mm + '</time> ' + c.label + '</button>';
      chapList.appendChild(li);
    });
  }
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
    loadYT().then(function () {
      player = new window.YT.Player('vsl-player', {
        host: 'https://www.youtube-nocookie.com', videoId: V.id,
        playerVars: { autoplay: 1, start: at || 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: function (e) { e.target.getIframe().title = 'Vídeo de apresentação do Curso Completo de Tarot e Magia'; },
          onStateChange: function (e) { if (e.data === 1) watchProgress(); }
        }
      });
    });
  }
  // Percentual = tempo REALMENTE assistido / duração (pular para um capítulo não conta como assistido).
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
        if (!sent[p] && watched / d * 100 >= p) { sent[p] = true; track('VSL_Progress', { video: V.id, percent: p }, true); }
      });
      if (player.getPlayerState && player.getPlayerState() !== 1) clearInterval(progressTimer);
    }, 1000);
  }
  if (vslBox) vslBox.querySelector('.play').addEventListener('click', function () { startVsl(0); });
  document.querySelectorAll('[data-seek]').forEach(function (b) {
    b.addEventListener('click', function () { startVsl(Number(b.getAttribute('data-seek'))); vslBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  });
  // Miniatura em alta resolução indisponível → usa a padrão
  document.querySelectorAll('.video img').forEach(function (img) {
    img.addEventListener('error', function () { if (!/hqdefault/.test(img.src)) img.src = img.src.replace(/maxresdefault|sddefault/, 'hqdefault'); });
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
  var hero = document.querySelector('.hero');
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
