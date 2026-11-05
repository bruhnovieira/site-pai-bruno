# Atualização da página do Método Arcano — 04/11/2026

Página: https://www.paibrunovieira.com.br/ (home). Anterior: `docs/auditoria-metodo-arcano-2026-10-17.md`.

## Recuperação

- Tag git `recuperacao-2026-11-04-antes-vsl-nova` → commit `f172a24` (o que estava no ar).
- Deployment anterior em produção: `site-pai-bruno-7rej14rci-pai-bruno.vercel.app`.
- Reverter: `npx vercel rollback site-pai-bruno-7rej14rci-pai-bruno.vercel.app` (imediato) ou `git revert` do commit desta atualização.

## O que foi conferido (só leitura, sem compra, sem abrir o checkout no navegador)

| Item | Resultado |
|---|---|
| Checkout `pay.hotmart.com/D101917640B?off=x6ba7awn` | produto "Curso Completo de Tarot e Magia com Pai Bruno", oferta "Novembro 2026" |
| Preço | **R$ 597,00 à vista · 12× R$ 49,75 sem juros (total R$ 597,00)** |
| Garantia | 7 dias (`warrantyDays: 7`) |
| Formas | cartão, PayPal, Apple Pay, cartão virtual (oferta x6ba7awn); Pix, boleto e dois cartões (oferta 6x3p7uv7, R$ 597) |
| Oferta padrão (sem `off`) | R$ 480 · 12× R$ 49,64 — não usada |
| **Oferta de R$ 497** | **não encontrada** em nenhum link conhecido |
| Nova VSL `PjLWENcb39k` | não listada, incorporação permitida. Às 20:57 "sendo processada"; às ~21:20 reproduzível, 14:56, **miniatura ainda não gerada** |
| GA4 / GTM / Google Ads | **nenhum ID** no site nem no checkout |
| Meta Pixel | 756056427466204 (site) + InitiateCheckout/Purchase enviados pela Hotmart |

## Divergência de preço (pendência principal)

A nova VSL anuncia **R$ 497 à vista ou 12× R$ 51,40**. O checkout cobra **R$ 597**. Por isso:

- **O preço da página não foi alterado** (continua R$ 597, igual ao checkout).
- **A VSL nova ainda não foi colocada no ar**: mostrar um vídeo dizendo R$ 497 com um checkout de R$ 597 seria preço divergente.
  A página continua com a VSL anterior (`8JIr3XQJ9yQ`) e o aviso "prevalecem as condições desta página e do checkout".

Observação: 12× R$ 51,40 é exatamente o que a Hotmart cobra por R$ 497 **com juros pagos pelo comprador**
(mesma tabela da oferta padrão: R$ 480 → 12× R$ 49,64). Ou seja, a VSL corresponde a uma oferta de R$ 497 com
parcelamento "juros por conta do comprador" (total parcelado R$ 616,80), e não "sem juros".

**Para ativar a VSL nova** (10 minutos, depois que a oferta existir):
1. Hotmart → criar oferta R$ 497, até 12×, juros por conta do comprador; copiar o código (`off=`).
2. `dist/curso-tarot-e-magia/config.js`: `checkoutUrl` com o novo `off`; `offer` e `checkoutVerified` =
   `{ offer: '<código>', price: 497, installments: 12, installmentValue: '51,40', interestFree: false }`; `vsl` = `vslNova`.
3. `dist/index.html`: trocar o `off=` dos 5 links, o `"price":"597.00"` do JSON-LD, os textos de fallback (R$ 597 / 49,75),
   a miniatura (`/vi/PjLWENcb39k/`) e os textos "sem juros".
4. `npm run conferir` (precisa sair "Tudo confere") → commit → `npx vercel deploy --prod`.

Se preferir manter R$ 597, a VSL precisaria ser reeditada sem o preço falado (ou com R$ 597).

## O que mudou na página

- **Primeira dobra:** título "Aprenda Tarot com profundidade, método e confiança.", subtítulo do Método Arcano, VSL 16:9
  logo no topo, botão "Quero começar minha jornada no Tarot" **direto para o checkout**, preço, acesso vitalício, garantia e Hotmart.
  Fundo escuro com dourado; no celular, vídeo e botão aparecem na primeira tela (botão a ~580 px em 375×812).
- **Player:** só a miniatura carrega (com `fetchpriority=high`); o YouTube (nocookie) só é baixado no clique; sem autoplay ao abrir;
  o selo "Assistir" fica no canto inferior, não sobre o rosto.
- **Nova seção "Para quem é"** (iniciantes, quem já tira cartas e trava, quem quer aprofundar/atender) + "para quem não é".
- Ordem: Para quem é → Método (3 pilares + exercício) → Conteúdo (12 módulos) + CTA intermediário → Quem é Pai Bruno →
  Depoimentos (reais, autorizados) → O que está incluído + Investimento → Garantia → FAQ → Chamada final.
- Removidos: seção de VSL separada com capítulos (o vídeo novo tem outra minutagem), tabela "sem estrutura × com o método"
  (repetia os pilares), referências "exemplos que eu dou no vídeo".
- FAQ: novas perguntas sobre conhecimento prévio, formato das aulas e formas de pagamento (inclui PayPal, conferido no checkout).
- SEO: title e description novos, `og:locale`, `og:image:alt`, Twitter tags, JSON-LD `Person` + `Course` (com `offers` e
  `hasCourseInstance` online) + `FAQPage`. URL canônica e sitemap mantidos.
- Botões têm o link do checkout já no HTML (funcionam sem JavaScript); o JS acrescenta UTMs, `fbclid`, `gclid`, `src` e `sck=lp_v3_<posição>`.

## Rastreamento

| Plataforma | Evento | Quando | Observação |
|---|---|---|---|
| Meta | PageView, ViewContent | carregamento | com `eventID` |
| Meta | OfferView, CheckoutClick, VSL_Play, VSL_Progress, Depoimento_Play | personalizados | como antes |
| Meta | InitiateCheckout, Purchase | **Hotmart** | a página não envia (evita duplicar) |
| Google (desligado até ter IDs) | page_view, view_item, begin_checkout (clique), video_start, video_progress | — | `config.google` |
| Google | purchase | **somente Hotmart** | configurar na Hotmart (Ferramentas → Pixel de rastreamento) |

Para ligar o Google: preencher `google.ga4Id` / `google.adsId` (ou `google.gtmId`) em `config.js` com IDs reais.
No Google Ads, a conversão principal deve ser a compra registrada pela Hotmart, não o `begin_checkout`.

## Pendências reais

1. Oferta de R$ 497 na Hotmart (ou decisão de manter R$ 597 e reeditar a VSL) — bloqueia a troca do vídeo.
2. Miniatura da VSL nova ainda sendo gerada pelo YouTube.
3. IDs de GA4 / Google Ads / GTM e configuração do `purchase` na Hotmart.
4. Conferir no Test Events da Meta, depois do deploy, que PageView/ViewContent continuam chegando.
5. Legendas/transcrição da VSL nova ainda não disponíveis: a copy não foi alinhada frase a frase ao vídeo.
