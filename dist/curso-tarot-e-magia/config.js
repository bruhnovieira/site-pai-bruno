/*
  Configuração da nova página de vendas (Curso Completo de Tarot e Magia — Método Arcano).
  Tudo que é comercial (preço, parcelamento, checkout, modo prévia) fica AQUI, não no HTML.

  Oferta conferida em 17/10/2026 no payload público do checkout (sem compra):
  - https://pay.hotmart.com/D101917640B?off=x6ba7awn → oferta "x6ba7awn" ("Novembro 2026")
    R$ 597,00 à vista · 12× de R$ 49,75 (total R$ 597,00, juros absorvidos pelo produtor) · máx. 12×
    Cartão, dois cartões, Pix, boleto, PayPal, Apple Pay.
  - Não usar a oferta padrão "5zft0ttu" nem a "6x3p7uv7" (cobra juros no parcelamento).

  Publicada em produção como página inicial (/) em 17/10/2026. Se `offer` deixar de ser igual a
  `offer.checkoutVerified`, a página bloqueia os botões de compra sozinha. `preview: true` volta ao modo prévia
  (sem pixel, com barra de aviso).
*/
window.ARCANO = {
  preview: false,
  pixelId: '756056427466204',
  productionHost: 'www.paibrunovieira.com.br',
  checkoutUrl: 'https://pay.hotmart.com/D101917640B?off=x6ba7awn',
  productId: 'D101917640B',
  productName: 'Curso Completo de Tarot e Magia',
  // Código de origem que vai para o relatório da Hotmart (parâmetro sck) quando o visitante não traz um.
  sck: 'lp_v2',
  // VSL: para trocar pelo vídeo novo, mude id, duration e chapters (ou deixe chapters: []) e ajuste/remova note.
  vsl: {
    id: '8JIr3XQJ9yQ',
    duration: '6:29',
    note: 'Este vídeo foi gravado antes da condição atual. Prevalecem o preço e as condições desta página e do checkout.',
    chapters: [
      { t: 0, label: 'Para quem é' },
      { t: 116, label: 'Quem sou eu e por que criei o método' },
      { t: 167, label: 'O erro da decoreba e os 3 pilares' },
      { t: 225, label: 'Três exercícios práticos' },
      { t: 306, label: 'O que a formação inclui' }
    ]
  },
  // Depoimentos: autorização de uso confirmada pelo Pai Bruno em 17/10/2026.
  testimonialsEnabled: true,
  offer: {
    price: 597,
    installments: 12,
    installmentValue: '49,75',
    interestFree: true,
    // O que o checkout da oferta x6ba7awn cobra (conferido em 17/10/2026).
    checkoutVerified: { offer: 'x6ba7awn', price: 597, installments: 12, installmentValue: '49,75', interestFree: true }
  },
  guaranteeDays: 7,
  testimonials: [
    { name: 'Janieth Costa', id: 'M4clJeavT1o', duration: '0:33' },
    { name: 'Sheila Coelho', id: '9SrdNWEO4Jw', duration: '1:27' },
    { name: 'Naiara Reis', id: 'H0s-LDJCLCw', duration: '1:20' }
  ]
};
