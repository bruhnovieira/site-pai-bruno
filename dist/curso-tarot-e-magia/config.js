/*
  Configuração da página de vendas (Curso Completo de Tarot e Magia — Método Arcano).
  Tudo que é comercial (preço, parcelamento, checkout, vídeo, rastreamento) fica AQUI, não no HTML.
  Antes de publicar qualquer mudança aqui, rode:  node scripts/conferir-oferta.mjs
  (lê o checkout público da Hotmart e o status do vídeo no YouTube, sem abrir navegador e sem disparar pixel).

  Ofertas oficiais definidas pelo Pai Bruno em 04/11/2026 e conferidas no payload público do checkout (sem compra):
  - PRINCIPAL  https://pay.hotmart.com/D101917640B?off=fjjf36k2 ("Curso Completo de Tarot e Magia - Novembro 2026")
    R$ 497,00 à vista · até 12× no cartão com juros do comprador (12× R$ 51,40 = R$ 616,80) · garantia 7 dias.
    Cartão, dois cartões, Pix, boleto, PayPal, Apple Pay.  → todos os botões principais.
  - ALTERNATIVO https://pay.hotmart.com/D101917640B?off=gxj0d4vh ("Novembro 2026")
    Só "Parcelamento Hotmart": Pix Parcelado, Boleto Parcelado ou cobrança mensal no cartão sem comprometer o limite,
    até 12 parcelas mensais com juros (12× R$ 51,46). → somente o botão secundário de parcelamento alternativo.
  - Antigas, NÃO usar: x6ba7awn (R$ 597), 5zft0ttu (R$ 480), 6x3p7uv7.

  Se `offer` deixar de ser igual a `offer.checkoutVerified`, a página bloqueia os botões de compra sozinha.
  `preview: true` volta ao modo prévia (sem pixel, com barra de aviso).
*/
window.ARCANO = {
  preview: false,
  pixelId: '756056427466204',
  productionHost: 'www.paibrunovieira.com.br',
  checkoutUrl: 'https://pay.hotmart.com/D101917640B?off=fjjf36k2',
  // Checkout alternativo (Parcelamento Hotmart). Usado só nos elementos com data-cta-alt.
  altCheckoutUrl: 'https://pay.hotmart.com/D101917640B?off=gxj0d4vh',
  altCheckoutVerified: { offer: 'gxj0d4vh', price: 497, methods: ['HOTMART_INSTALLMENTS'] },
  productId: 'D101917640B',
  productName: 'Curso Completo de Tarot e Magia',
  // Código de origem que vai para o relatório da Hotmart (parâmetro sck) quando o visitante não traz um.
  sck: 'lp_v3',

  /* Google (GA4 / Google Ads / Google Tag Manager).
     Vazio = nada do Google carrega. Preencha só com IDs reais da conta do Pai Bruno:
       ga4Id: 'G-XXXXXXXXXX'   adsId: 'AW-XXXXXXXXX'   gtmId: 'GTM-XXXXXXX'
     Com gtmId preenchido, a página carrega SÓ o GTM e entrega os eventos no dataLayer
     (o GA4/Ads devem ser configurados dentro do contêiner); sem gtmId, carrega o gtag.js direto.
     Eventos enviados: page_view (automático), view_item, begin_checkout (clique para o checkout),
     video_start/video_progress. NUNCA purchase: a compra só pode vir da Hotmart (pagamento confirmado). */
  google: { ga4Id: '', adsId: '', gtmId: 'GTM-WLBS5LLC' },
  /* GTM-WLBS5LLC (04/11/2026): contêiner da conta Google Ads 239-360-6190. Publicado com a tag Google AW-18556789076.
     O GA4 deve ser criado DENTRO do contêiner (ver docs/google-tracking-2026-11-04.md). Não colocar ga4Id/adsId aqui
     enquanto houver gtmId: isso duplicaria page_view e conversões. */

  // Aviso de cookies + Consent Mode v2. false = sem aviso (NÃO recomendado: Google e Meta passariam a carregar sem escolha).
  consentRequired: true,
  // 'basic' = GTM só depois do aceite (padrão, mais conservador). 'advanced' = GTM já carrega com consentimento negado.
  consentMode: 'basic',

  /* Atribuição de vendas na EVORAH (Inteligência de Marketing → Conexões → Site comercial).
     siteId vazio = nada é enviado. Preencha com o ID exibido na EVORAH depois de aplicar a migration. */
  evorah: { siteId: '', touchUrl: 'https://evorah.app.br/api/public/marketing/touch' },

  /* VSL oficial (enviada em 04/11/2026, 14:56). Anuncia R$ 497 à vista, igual à oferta principal fjjf36k2.
     Anterior: 8JIr3XQJ9yQ (R$ 597, pré-venda) — não usar mais. */
  vsl: { id: 'PjLWENcb39k', title: 'Curso Completo de Tarot e Magia com Pai Bruno', note: '' },

  // Depoimentos: autorização de uso confirmada pelo Pai Bruno em 17/10/2026.
  testimonialsEnabled: true,
  offer: {
    price: 497,
    installments: 12,
    installmentValue: '51,40',
    installmentTotal: '616,80',
    interestFree: false,
    // O que o checkout da oferta fjjf36k2 cobra (conferido em 04/11/2026).
    checkoutVerified: { offer: 'fjjf36k2', price: 497, installments: 12, installmentValue: '51,40', interestFree: false }
  },
  guaranteeDays: 7,
  /* Depoimentos. format: 'audio' (foto + áudio) ou 'video'. video: proporção real do player (w/h).
     poster/crop: miniatura do YouTube e a área útil dela (frações), para o card não mostrar faixas pretas. */
  testimonials: [
    { name: 'Janieth Costa', id: 'M4clJeavT1o', duration: '0:33', format: 'audio', video: 16 / 9,
      poster: { src: 'hqdefault', w: 480, h: 360, crop: { x: 151 / 480, y: 70 / 360, w: 168 / 480, h: 168 / 360 } } },
    { name: 'Sheila Coelho', id: '9SrdNWEO4Jw', duration: '1:27', format: 'video', video: 9 / 16,
      poster: { src: 'hq720', w: 1280, h: 720, crop: { x: 436 / 1280, y: 0, w: 408 / 1280, h: 1 } } },
    { name: 'Naiara Reis', id: 'H0s-LDJCLCw', duration: '1:20', format: 'video', video: 16 / 9,
      poster: { src: 'hqdefault', w: 480, h: 360, crop: { x: 155 / 480, y: 48 / 360, w: 170 / 480, h: 264 / 360 } } }
  ]
};
