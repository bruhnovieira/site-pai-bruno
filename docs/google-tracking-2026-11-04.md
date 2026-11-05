# Rastreamento Google, consentimento e vendas confirmadas — Método Arcano (04/11/2026)

## 1. Diagnóstico inicial (antes desta mudança)
| Item | Situação |
|---|---|
| Site | HTML estático na Vercel (projeto `site-pai-bruno`), `dist/` publicado; página de vendas = home `/` (`/curso-tarot-e-magia` redireciona para `/`). |
| Checkout | Hotmart, produto `D101917640B` (id 6255680). Principal `off=fjjf36k2` (R$ 497), alternativo `off=gxj0d4vh`. Página de obrigado é da Hotmart (domínio externo). |
| GTM `GTM-WLBS5LLC` | Existe e está publicado (público em googletagmanager.com). Contém só a tag Google `AW-18556789076` (Google Ads) + "dados fornecidos pelo usuário" automáticos. **Sem GA4, sem ação de conversão.** Não estava instalado no site. |
| GA4 do Pai Bruno | Não existe. O `G-GQH2V1F11Q` e os `AW-991176222`/`AW-11378722631` do checkout são da própria Hotmart. |
| Meta Pixel | `756056427466204` no site (navegador) + Hotmart (navegador + servidor). Carregava sem aviso de cookies. |
| Consentimento | Não havia aviso de cookies na página de vendas. |
| Compra | Nenhuma conversão Google de compra. Nada no site envia `purchase` (correto). |

## 2. O que mudou no site (`dist/curso-tarot-e-magia/`)
- **GTM `GTM-WLBS5LLC`** em `config.js → google.gtmId`. Só o GTM carrega (sem gtag direto) → sem page_view/conversão duplicada.
- **Aviso de cookies + Google Consent Mode v2** (`consentRequired: true`, `consentMode: 'basic'`):
  - padrão: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` = `denied`; `ads_data_redaction` e `url_passthrough` ligados.
  - modo básico: o GTM **só carrega depois do “Aceitar”**. Recusar = nada do Google carrega.
  - Meta Pixel: `fbq('consent','revoke')` antes do `init`; no aceite, `grant` e reenvio de PageView/ViewContent com o **mesmo eventID** (sem duplicar).
  - Link “Preferências de cookies” no rodapé reabre o aviso. Escolha em `localStorage` (`arcano_consent_v1`).
- **dataLayer versionado** (`tracking_version: "2026-11-04"`):
  | Evento | Quando | Parâmetros |
  |---|---|---|
  | `view_item` | 1× por carregamento | `ecommerce: {currency:'BRL', value:497, items:[{item_id:'D101917640B', item_name, item_brand, item_category, price, quantity}]}` |
  | `begin_checkout` | clique para o checkout, **1× por tipo de checkout por página** (dedupe) | `ecommerce` + `cta_position`, `payment_type` (`padrao`/`parcelamento_hotmart`) |
  | `video_start` / `video_progress` | VSL | `video_provider`, `video_title`, `video_url`, `video_percent` |
  | `consent_update` | aceite/recusa | `consent_ads`, `consent_analytics` |
  | `purchase` | **nunca no site** | vem do servidor (EVORAH) quando a Hotmart confirma o pagamento |
  `generate_lead` não foi criado: não há captação de leads nesta página.
- **Atribuição** (só com aceite): código aleatório `ev…` (90 dias, `localStorage arcano_aid_v1`) enviado ao checkout como `xcod`. UTMs, `gclid`, `gbraid`, `wbraid` continuam indo ao checkout como antes. Se `config.evorah.siteId` estiver preenchido, a visita é registrada na EVORAH (`POST /api/public/marketing/touch`, sem PII).
- Testes feitos: página carrega; antes do aceite nada de Google e Meta revogado; aceite → GTM carrega, consentimento atualizado, `xcod` em todos os botões (principal e alternativo); recusa → sem código e sem Google; 2 cliques = 1 `begin_checkout`; celular 375 px ok; sem erros de console; `npm run lint` e `node scripts/conferir-oferta.mjs` ok.

## 3. Arquitetura de compra confirmada (sem dupla contagem)
```
Visita (site) --aceite--> toque na EVORAH (UTMs, gclid…, client_id GA4) + xcod=ev… no link
      ↓ clique
Checkout Hotmart --pagamento APROVADO--> Webhook Hotmart 2.0 --> EVORAH /api/webhooks/hotmart/<fonte>
      ↓ (hottok validado, evento idempotente, sem dados do comprador)
venda confirmada (marketing_mi_sales) → atribuição pelo xcod → fila:
   • GA4 Measurement Protocol: purchase (transaction_id = transação Hotmart) — só se havia client_id com consentimento
   • Google Ads: upload de conversão offline (gclid/gbraid/wbraid, order_id = transação) — precisa developer token
```
- Conta como venda **só** `PURCHASE_APPROVED`/`PURCHASE_COMPLETE`. Pix/boleto gerado, pendente, expirado, cancelado e abandono de carrinho não contam. Reembolso/chargeback revertem (GA4 `refund`).
- Valor da conversão = preço da oferta (`original_offer_price`, R$ 497), sem juros do parcelamento (o valor pago fica separado). **Conferir no primeiro evento real** que a Hotmart envia esse campo.
- **Conversão principal do Google Ads recomendada**: “Compra confirmada (importação)” do tipo *Importar → cliques* (UPLOAD_CLICKS), contagem **Uma**, janela 30–90 dias, valor = valor de cada conversão, modelo baseado em dados. Esta é a única marcada como **principal**.
- Para não contar duas vezes:
  - **Não** cadastrar o Google Ads/GA4 no “Pixel de rastreamento” da Hotmart para compra, enquanto o envio via EVORAH estiver ativo (a Hotmart dispararia uma 2ª compra).
  - Se importar o `purchase` do GA4 no Google Ads, deixe-o como **secundária** (observação).
  - `begin_checkout` nunca como conversão principal.
- Alternativa provisória enquanto o developer token não sai: cadastrar na Hotmart (Ferramentas → Pixel de rastreamento → Google Ads) o ID `AW-18556789076` + rótulo de uma ação “Compra (Hotmart)” do tipo site. Ao ativar a importação via EVORAH, essa ação deve virar **secundária** ou ser removida.

## 4. GA4 (a criar — não existia)
1. analytics.google.com → Administrador → Criar propriedade: “Pai Bruno — paibrunovieira.com.br”, fuso **(GMT-03:00) São Paulo**, moeda **BRL**.
2. Fluxo de dados Web: `https://www.paibrunovieira.com.br`. Anote o **Measurement ID (G-…)**. Medição otimizada ligada (sem “formulários” se não houver formulários).
3. Fluxo → **Measurement Protocol API secrets** → Criar (“EVORAH”). Guarde o secret (vai na EVORAH, nunca no site).
4. Administrador → Fluxo → Configurar tag → **Listar referências indesejadas**: `pay.hotmart.com`, `hotmart.com`.
5. Eventos principais (conversões): marcar `purchase`. (`begin_checkout` pode ser evento-chave para análise, nunca principal no Ads.)
6. Tráfego interno: definir o IP do Terreiro/escritório se houver acesso frequente.
7. Vincular ao Google Ads (Administrador → Vinculações de produtos → Google Ads → 239-360-6190).

## 5. GTM — tags a criar dentro de GTM-WLBS5LLC
(O GTM não estava acessível nesta sessão; a instalação no site já está pronta para receber estas tags.)
1. **Variável** Constante `GA4 Measurement ID` = o G-… do item 4.2.
2. **Tag Google** (Google tag) com `{{GA4 Measurement ID}}` — acionador *Initialization - All Pages*. Ela envia o `page_view` (uma única vez; a página é estática, sem navegação client-side).
3. **Evento GA4** `view_item` — “Enviar dados de e-commerce” = dataLayer — acionador evento personalizado `view_item`.
4. **Evento GA4** `begin_checkout` — idem + parâmetros `cta_position` = `{{DLV - cta_position}}`, `payment_type` = `{{DLV - payment_type}}` — acionador evento personalizado `begin_checkout`.
5. **Evento GA4** `video_start` e `video_progress` (parâmetros `video_title`, `video_percent`).
6. Revise a tag Google `AW-18556789076` já existente: “Dados fornecidos pelo usuário” está com **coleta automática** de e-mail/telefone/endereço. A página não tem formulários, mas recomendo **desligar** a coleta automática (LGPD) — conversões otimizadas não são necessárias porque a compra vai por importação com gclid.
7. Visualizar (Tag Assistant) em `https://www.paibrunovieira.com.br/?gtm_debug=x`, aceitar cookies, conferir 1 page_view, 1 view_item, begin_checkout ao clicar. Depois **Enviar → Publicar**.

## 6. Google Ads — o que verificar/fazer (sem acesso nesta sessão)
- Conta 239-360-6190, campanha de Pesquisa (R$ 25/dia, não alterar). **Não houve acesso** (o navegador não estava logado), então status, políticas, palavras-chave, termos de pesquisa, locais, redes, URLs finais e faturamento **não foram auditados**.
- Se a campanha estiver ativa sem medição de compra: ela gasta e otimiza “às cegas”. Decisão sua: pausar até a conversão de compra existir, ou manter com lance por cliques (Maximizar cliques com limite de CPC) até lá.
- Redes: em Pesquisa, desmarque **Rede de Display** e avalie “Parceiros de pesquisa”.
- Sufixo de URL final (nível da conta): `utm_source=google&utm_medium=cpc&utm_campaign={_campanha}&utm_id={campaignid}&utm_term={keyword}` — permite à EVORAH ligar cada venda à campanha.
- Requisitos legais (cursos/tarot): as restrições comuns são de “serviços astrológicos/esotéricos” e de alegações. Siga o alerta exibido → “Ver detalhes/Recorrer” na própria política; não tente contornar com palavras alternativas.
- Developer token: Ferramentas → **Central da API** (exige conta de **administrador/MCC**; crie uma MCC gratuita e vincule 239-360-6190 se necessário). O token começa em nível de teste; peça **Acesso básico** para ler contas reais.

## 7. Diferenças entre fontes (leia antes de comparar números)
- Clique (Ads) ≠ sessão (GA4) ≠ usuário. Bloqueadores, recusa de cookies e quem fecha antes de carregar fazem sessões < cliques.
- “Conversões” do Google Ads usam o modelo/janela do Google (atribui na data do clique, pode modelar conversões). “Compras confirmadas” da EVORAH são transações reais na data do pagamento.
- GA4 consolida em 24–48 h; Google Ads em ~3 h; webhook Hotmart em segundos. O painel não promete tempo real.
- Usuários do GA4 somados por dia contam a mesma pessoa várias vezes.

## 8. Privacidade
- Nenhum nome, e-mail, telefone ou documento de comprador vai para GA4, Google Ads ou para o banco da EVORAH.
- Recomendo atualizar a Política de Privacidade (seção 8, Cookies) citando Google Analytics/Google Ads/Meta, o aviso de cookies e o registro de origem da venda (código `xcod`). **Não alterei o texto legal**; sugestão de parágrafo:
  > Com o seu consentimento, usamos Google Analytics, Google Ads e Meta para medir visitas e anúncios. Quando você clica para comprar, um código aleatório acompanha o checkout da Hotmart para sabermos de qual anúncio ou página veio a compra; nenhum dado pessoal seu é enviado a essas ferramentas por nós. Você pode mudar sua escolha em “Preferências de cookies”, no rodapé.
