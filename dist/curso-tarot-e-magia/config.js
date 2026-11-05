/*
  Configuração da página de vendas (Curso Completo de Tarot e Magia — Método Arcano).
  Tudo que é comercial (preço, parcelamento, checkout, vídeo, rastreamento) fica AQUI, não no HTML.
  Antes de publicar qualquer mudança aqui, rode:  node scripts/conferir-oferta.mjs
  (lê o checkout público da Hotmart e o status do vídeo no YouTube, sem abrir navegador e sem disparar pixel).

  Oferta conferida em 04/11/2026 no payload público do checkout (sem compra):
  - https://pay.hotmart.com/D101917640B?off=x6ba7awn → oferta "x6ba7awn" ("Novembro 2026")
    R$ 597,00 à vista · 12× de R$ 49,75 (total R$ 597,00, juros absorvidos pelo produtor) · garantia 7 dias.
    Cartão, dois cartões, Pix, boleto, PayPal, Apple Pay.
  - Não usar a oferta padrão "5zft0ttu" (R$ 480) nem a "6x3p7uv7" (cobra juros no parcelamento).

  Se `offer` deixar de ser igual a `offer.checkoutVerified`, a página bloqueia os botões de compra sozinha.
  `preview: true` volta ao modo prévia (sem pixel, com barra de aviso).
*/
window.ARCANO = {
  preview: false,
  pixelId: '756056427466204',
  productionHost: 'www.paibrunovieira.com.br',
  checkoutUrl: 'https://pay.hotmart.com/D101917640B?off=x6ba7awn',
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
  google: { ga4Id: '', adsId: '', gtmId: '' },

  /* VSL. A nova VSL (PjLWENcb39k, enviada em 04/11/2026) ainda estava "sendo processada" no YouTube
     e anuncia R$ 497 / 12× R$ 51,40, condição que NÃO existe no checkout (que cobra R$ 597).
     Para ativá-la: (1) criar na Hotmart a oferta de R$ 497, (2) trocar checkoutUrl/offer/checkoutVerified
     acima pelos valores dessa oferta, (3) trocar `vsl` por `vslNova` (sem note), (4) rodar o script de conferência. */
  vsl: {
    id: '8JIr3XQJ9yQ',
    title: 'Apresentação do Curso Completo de Tarot e Magia',
    note: 'Este vídeo foi gravado antes da condição atual. Prevalecem o preço e as condições desta página e do checkout.'
  },
  vslNova: { id: 'PjLWENcb39k', title: 'Curso Completo de Tarot e Magia com Pai Bruno', note: '' },

  // Depoimentos: autorização de uso confirmada pelo Pai Bruno em 17/10/2026.
  testimonialsEnabled: true,
  offer: {
    price: 597,
    installments: 12,
    installmentValue: '49,75',
    interestFree: true,
    // O que o checkout da oferta x6ba7awn cobra (conferido em 04/11/2026).
    checkoutVerified: { offer: 'x6ba7awn', price: 597, installments: 12, installmentValue: '49,75', interestFree: true }
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
