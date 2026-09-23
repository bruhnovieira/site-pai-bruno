/*
  Rastreamento das landing pages de Rituais (Meta Pixel 756056427466204).
  Usado SOMENTE em páginas de rituais. Não incluir na home, na /politica nem nas páginas do curso.

  Cada página de ritual define, antes de carregar este arquivo:
    window.RITUAL = {ritual:'7_chaves_de_exu', content_name:'Ritual das 7 Chaves de Exu', value:77.00, format:'presencial', location:'belo_horizonte'};
  e marca todo link de WhatsApp com o atributo data-wa.

  Eventos (trackCustom):
    PageView_Rituais     uma vez por carregamento
    ViewContent_Rituais  uma vez por carregamento
    WhatsApp_Rituais     um por clique em link [data-wa]
  Nenhum dado pessoal é enviado: apenas dados da página e do ritual.
*/
(function () {
  var r = window.RITUAL;
  if (!r || typeof window.fbq !== 'function' || window.__rituaisPixel) return;
  window.__rituaisPixel = true;

  var base = {ritual: r.ritual, content_name: r.content_name, content_category: 'Rituais', format: r.format};

  function params(extra) {
    var p = {}, k;
    for (k in base) p[k] = base[k];
    for (k in extra) p[k] = extra[k];
    return p;
  }

  window.fbq('trackCustom', 'PageView_Rituais', params({location: r.location}));
  window.fbq('trackCustom', 'ViewContent_Rituais', params({value: r.value, currency: 'BRL'}));

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-wa]') : null;
    if (!a) return;
    window.fbq('trackCustom', 'WhatsApp_Rituais', params({value: r.value, currency: 'BRL', contact_method: 'whatsapp'}));
  });
})();
